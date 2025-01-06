// requires
var batchMosaic = require('users/ee-ers/puWetMap:imgProcessing/mosaicGen.js')
var batchRoi = require('users/ee-ers/puWetMap:imgProcessing/reg_of_interest.js')

// regions of interest 
var rois = batchRoi.wetCatchBoundaries

//  exporting
function mosaicExport (image, region, year){

  var version = 1
  
  var description = 'mosaic-' + year + '_urbWet_' + '_rev-' + version
  
  var assetId = 'projects/ee-ers/assets/mosaics/urbanWetlands/'
  
  var exportImage = true
  
  if(exportImage == true){
    
    Export.image.toAsset({
      image: image, 
      description: description, 
      assetId: assetId + description, 
      region: region, 
      scale: 30, 
      maxPixels: 1e13
    })
    
  }
 
}

// variables
var years = ee.List.sequence(1986, 2020).getInfo()
var region = ee.FeatureCollection(rois).geometry();//print(region)

// exporting mosaics by region
years.forEach(function (year){
  
  var imgCol = ee.ImageCollection(
    
    rois.map(function (feature){
    
        var roi = ee.Feature(feature)//; print(roi.get('system:index'))
        
        var imgResult = ee.Image(batchMosaic.landsatMosaic (year, roi.geometry()))
        /*
          year -> the year of analisys
          roi -> bounds to considering (geometry)
        */
      
      return imgResult
    })
  )
  .mosaic().set('year', year)
  
  // see the layer
  // Map.addLayer(imgCol.clip(region), {}, 'result ' + year)
  
  // export the results
  mosaicExport (imgCol, region, year)

})

// ------------- next step
// https://code.earthengine.google.com/96b3b9806f6a289b66866608a5276e54
