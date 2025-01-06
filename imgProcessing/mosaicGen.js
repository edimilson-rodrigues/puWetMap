// code to generate mosaics using landsat images
// defining the region to export
var geometry =
    /* color: #d63000 */
    /* shown: false */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[-48.011260090549776, -21.89830589435222],
          [-48.011260090549776, -22.110938774797223],
          [-47.753081379612276, -22.110938774797223],
          [-47.753081379612276, -21.89830589435222]]], null, false);


    // SR
var datasetSR_LT05 = ee.ImageCollection("LANDSAT/LT05/C02/T1_L2"),
    datasetSR_LE07 = ee.ImageCollection("LANDSAT/LE07/C02/T1_L2"),
    datasetSR_LC08 = ee.ImageCollection("LANDSAT/LC08/C02/T1_L2")

// external functions
var bandNames = {

  //Landsat Collection 2
  'SR_LT05' : {
      'bandNames': ['SR_B1', 'SR_B2', 'SR_B3', 'SR_B4', 'SR_B5', 'SR_B7'],
      'newNames': ['BLUE', 'GREEN', 'RED', 'NIR', 'SWIR1', 'SWIR2']
  },
  
  'SR_LE07' : {
      'bandNames': ['SR_B1', 'SR_B2', 'SR_B3', 'SR_B4', 'SR_B5', 'SR_B7'],
      'newNames': ['BLUE', 'GREEN', 'RED', 'NIR', 'SWIR1', 'SWIR2']
  },
  
  'SR_LC08' : {
      'bandNames': ['SR_B2', 'SR_B3', 'SR_B4', 'SR_B5', 'SR_B6', 'SR_B7'],
      'newNames': ['BLUE', 'GREEN', 'RED', 'NIR', 'SWIR1', 'SWIR2']
  },

};

// function to rename bands
function renameBands (key) {return bandNames[key];}

// band names
var bandsSR_LT05 = renameBands("SR_LT05");
var bandsSR_LE07 = renameBands("SR_LE07");
var bandsSR_LC08 = renameBands("SR_LC08");
var bandsSR_LC09 = renameBands("SR_LC09");

// external functions
var preProcess = require("users/ee-ers/puWetMap:imgProcessing/preProcess_Landsat.js");
var indexesLib = require("users/ee-ers/puWetMap:imgProcessing/indexesLib.js");

// surface Reflectance Collection
function landsatMosaic (year, roi){

    // from january
    var start = year + '-01-01'
    
    // to december
    var end = year + '-12-31'

    // landsat surface reflectance
    var landsatSR = 
        ee.ImageCollection(
        
        //Landsat SR 5 col2
        datasetSR_LT05
        .filterBounds(roi)
        .filterDate(1985 + '-01-01', 2011 + '-12-31')
        .map(preProcess.maskClouds_QA)
        .map(preProcess.applyScaleFactors)
        .select(bandsSR_LT05.bandNames, bandsSR_LT05.newNames)
        .merge(
         
        //Landsat SR 7 col2
        datasetSR_LE07
        .filterBounds(roi)
        .filterDate(2003 + '-01-01', 2012 + '-12-31')
        .map(preProcess.maskClouds_QA)
        .map(preProcess.applyScaleFactors)
        .select(bandsSR_LE07.bandNames, bandsSR_LE07.newNames))
        .merge(
    
        //Landsat SR 8 col2
        datasetSR_LC08
        .filterDate(2013 + '-01-01', 2024 + '-12-31')
        .filterBounds(roi)
        .map(preProcess.maskClouds_QA)
        .map(preProcess.applyScaleFactors)
        .select(bandsSR_LC08.bandNames, bandsSR_LC08.newNames))

        // filtering the created collection
        ).filterDate(start, end)
    
    // get indexes to be reduced by median
    var addIndexMedian = function(image){
        
        // vegetation indices
        image = image.addBands(indexesLib.calcNDVI(image));
        image = image.addBands(indexesLib.calcEVI(image));
        image = image.addBands(indexesLib.calcEVI2(image));
        
        // water indices
        image = image.addBands(indexesLib.calcMNDWI(image));
        image = image.addBands(indexesLib.calcNDWIm(image));
        image = image.addBands(indexesLib.calcNDMI(image));
        
        // wetland indices (mangroove)
        image = image.addBands(indexesLib.calcMMRI(image));
        
        // bare soils and imperviousness indices
        image = image.addBands(indexesLib.calcUI(image));
        image = image.addBands(indexesLib.calcIBI(image));
        image = image.addBands(indexesLib.calcNDBSI(image))
          
      return image
    };
    
    // get the median mosaic
    var mosaicMedian = landsatSR
        .map(addIndexMedian).median()
        .add(1).multiply(1000).toInt16()
    
  return mosaicMedian
}

exports.landsatMosaic = landsatMosaic

// // uncomment the following lines and check some results
// Map.centerObject(geometry, 13)

// var year = 1985
// Map.addLayer(
//   landsatMosaic (year, geometry),
//   {min: 1000, max: 1150, bands: ['RED', 'GREEN', 'BLUE']},
//   'test ' + year
//   )

// var year = 2021
// Map.addLayer(
//   landsatMosaic (year, geometry),
//   {min: 1000, max: 1150, bands: ['RED', 'GREEN', 'BLUE']},
//   'test ' + year
//   )
