// batch
var batchRF = require('users/ee-ers/puWetMap:classification/classify.js')

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
var bandsListIds = ee.List.sequence(0,indexList.length-1).getInfo()

// majority mean filter to the classification
function filter (image){

  // classification filtered
  var classificationFiltered = image.reduceNeighborhood({
    reducer: ee.Reducer.mean(), 
    kernel: ee.Kernel.square(1),
  }).reproject('EPSG:4326', null, 30).rename('classification')
  
  return classificationFiltered
}

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

Map.addLayer(mosaicCollection.select('MNDWI'), {}, 'mosaicCollection', false)

/*index tendencies*/
function indexSet (mosaicCollection, index){
    
    //  regression
    var regression = mosaicCollection
    .sort('year')
    .select(['year', index])
    .reduce(ee.Reducer.sensSlope())
  
  return regression.select(['slope'], [index])
}

/*function to overlay results*/
function overlayResults (index){return indexSet (mosaicCollection, index)}

// img of wetlands soils
var subRegionsAsset = 'users/ee-ers/Mestrado/selected_watershed_image_0km' 
var subImage = ee.Image(subRegionsAsset)
.remap([1,2,3,4,5,6,7,8,9], [1,2,3,4,5,0,7,8,6]) 
.reproject('EPSG:4326', null, 30)
.gt(0).selfMask()

// classification process
var imgToClassify = ee.ImageCollection(indexList.map(overlayResults))
.toBands().select(bandsListIds, indexList)
.multiply(subImage).multiply(1000).toInt()

Map.addLayer(imgToClassify.gte(-1e13), {}, 'img to classify', false)

// running the classification
var samples = ee.FeatureCollection('projects/ee-ers/assets/samples/puWetMapClassificationSamples').randomColumn().sort('random')

// samples 
var positiveSamples = samples.filter(ee.Filter.eq('class', 1));//print('positiveSamples', positiveSamples.size())
var negativeSamples = samples.filter(ee.Filter.eq('class', 0));//print('negativeSamples', negativeSamples.size())

// samples
var classificationPoins = 

    // merging samples
          positiveSamples.limit(250)
    .merge(negativeSamples.limit(250))

// running the classification
var rfClassification = batchRF.classification (200, imgToClassify, classificationPoins, indexList, 5)
  /*
  classification(ntree, imgToClassify, samples, bands, leaf)
    ntree --> number of decision tree
    samples --> feat col of samples with 'class' property
    bands --> input bands to classification
    leaf --> number of minimum leaf population to RF classification
  */
  .multiply(100).toByte()

// palette
var palette = [
  '#9e0142',
  '#d53e4f',
  '#f46d43',
  '#fdae61',
  '#fee08b',
  '#ffffbf',
  '#e6f598',
  '#abdda4',
  '#66c2a5',
  '#3288bd',
  '#5e4fa2'
  ]
  
var classificationFiltered = filter(rfClassification).toByte()

// Map.addLayer(rfClassification, {min:0, max:100, palette: palette},'rf classification (not filtered)', false)
// Map.addLayer(classificationFiltered, {min:0, max:100, palette: palette},'rf classification (filtered)', false)

// exporting the results...
var version = 3
var description = 'classification_senSlope_v' + version
var region = classificationFiltered.geometry().bounds()

// ... to drive
Export.image.toDrive({
  image: classificationFiltered, 
  description: description, 
  folder: 'gee-periUrbanWetAreas', 
  fileNamePrefix: description, 
  region: region, 
  scale:30, 
  maxPixels:1e13
})

// ... to asset
var asset = 'projects/ee-ers/assets/urbWetQuality/qualityClassified/'

Export.image.toAsset({
  image: classificationFiltered, 
  description: description, 
  assetId: asset + description, 
  region: region, 
  scale: 30, 
  maxPixels: 1e13
})
  
