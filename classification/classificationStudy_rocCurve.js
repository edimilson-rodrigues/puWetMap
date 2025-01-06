// batch
var batchRF = require('users/ee-ers/puWetMap:classification/classify.js')
var batchAcc = require('users/ee-ers/puWetMap:classification/accCalc.js')

// variables
var version = 1 
var years = ee.List.sequence(1985, 2020).getInfo()

// list of quality index associated with wetlands conditions
var indexList = [ 
  
  // bare soil and imperviousness
  'NDBSI',//0 
  'IBI',// 1
  'UI',// 2
  
  // water
  'MNDWI',// 3
  'NDWIm',// 4
  'NDMI',// 5
  
  // wetland
  'MMRI',// 6
  
  // vegetation
  'NDVI',// 7
  'EVI',// 8
  'EVI2'// 9
]

// bands list as integers
var bandsListIds = ee.List.sequence(0, indexList.length-1).getInfo()

// majority mean filter to the classification
function filter (image){

  // classification filtered
  var classificationFiltered = image.reduceNeighborhood({
    reducer: ee.Reducer.mean(), 
    kernel: ee.Kernel.square(1),
  }).reproject('EPSG:4326', null, 30).rename('classification')
  
  return classificationFiltered
}

// mosaic results
function mosaicResults (year){
  
  // mosaics
  var version = 1
  var asset = 'projects/ee-ers/assets/mosaics/urbanWetlands/mosaic-'+year+'_urbWet__rev-'+ version
  return ee.Image(asset)
}

// mosaic collection
var mosaicCollection = ee.ImageCollection(
  
  years.map(function (year){
      
      var image = mosaicResults (year)
        // .select(indexList).divide(1000).subtract(1)
        .addBands(ee.Image.constant(year).rename('year').toInt())
      
      return image.set('year', year)
    })
  )

Map.addLayer(mosaicCollection, {}, 'mosaicCollection', false)

// index tendencies
function indexSet (mosaicCollection, index){
    
    //  regression
    var regression = mosaicCollection
    .sort('year')
    .select(['year', index])
    .reduce(ee.Reducer.sensSlope())
  
  return regression.select(['slope'], [index])
}

// function to overlay results
function overlayResults (index){return indexSet (mosaicCollection, index)}

// img of wetlands soils
var subRegionsAsset = 'users/ee-ers/Mestrado/selected_watershed_image_0km'  // O final pode ser 1km ou 2km
var subImage = ee.Image(subRegionsAsset).gt(0)

// classification process
var imgToClassify = ee.ImageCollection(indexList.map(overlayResults))
.toBands().select(bandsListIds, indexList)
.multiply(subImage).multiply(1000).toInt()

Map.addLayer(imgToClassify, {}, 'img to classify', false)

// training samples
var rawsamples = ee.FeatureCollection('projects/ee-ers/assets/samples/puWetMapClassificationSamples')
// .filter(ee.Filter.eq('sType', 't'))
// .remap([1,2], [1,0], 'class')

// // samples by class
// print(rawsamples.filter(ee.Filter.eq('class', 1)).size())
// print(rawsamples.filter(ee.Filter.eq('class', 0)).size())

// samples 
var positiveSamples = rawsamples.filter(ee.Filter.eq('class', 1)).randomColumn().sort('random')
var negativeSamples = rawsamples.filter(ee.Filter.eq('class', 0)).randomColumn().sort('random')

// classification samples
var classProp = 'CLASSVIS'
var validationSamples = ee.FeatureCollection('projects/ee-ers/assets/samples/samplesWithProperties_analyis_validation_v1-manualValidated')
.map(function (f){return f.set('class', ee.Number.parse(f.get(classProp)).int())})
.remap([1,2], [0,1], 'class')
.randomColumn({seed: 42})

// list of validation samples proportion
var list = ee.List.sequence(0.5, 1, 0.1).getInfo()
var balance_1 = 1.0
var balance_2 = 1.0

// classification and sampling region
function classificationStudy (threshold){

  // samples
  var classificationPoins = 

  // // printing samples size to inspect
  // print('positive', positiveSamples.limit(ee.Number(threshold*balance_1).int()).size())
  // print('negative', negativeSamples.limit(ee.Number(threshold*balance_2).int()).size())
  
  // };classificationStudy (200)
  
  // merging samples
         positiveSamples.limit(ee.Number(threshold*balance_1).int())
  .merge(negativeSamples.limit(ee.Number(threshold*balance_2).int()))
  
  // running the classification
  var rfClassification = batchRF.classification (200, imgToClassify, classificationPoins, indexList, 1)
    .multiply(100).toByte().divide(100)
  
  // filtering the classification
  var classificationFiltered = filter(rfClassification)
  .multiply(100).toByte().divide(100)
  .rename('classification')
  
  // get the classification value for each point
  var samplingValPoints = classificationFiltered.unmask()
      .sampleRegions({
        collection: validationSamples, 
        properties: ['class'], 
        scale: 30, 
        tileScale: 6, 
        geometries: false
      })
  
  // results
  return samplingValPoints
  .map(function (f){return f.set('size', threshold)})
  
}

// // testing
// print(classificationStudy (10))

// variables to run
var step = 5
var end = 295
var thresholdlist = ee.List.sequence(10, end, step).getInfo()

// running the code
thresholdlist.forEach(function (threshold){
  
  // min sample population
  var minSamplesPopulation = classificationStudy (threshold)
  
  // exporting the results
  var version = 6
  var description = 'sampleToRoc_t' + threshold 
      + '_step_' + step + '_v' + version 
      + '_b1-' + balance_1*10
      + '_b2-' + balance_2*10
  
  Export.table.toDrive({
    collection: minSamplesPopulation, 
    description: description, 
    folder: 'gee-periUrbanWetAreas', 
    fileNamePrefix: description, 
    fileFormat: 'CSV',
    selectors: ['class', 'classification', 'sSize', 'threshold']
  })  
  
})
