//RandomForest
function runRandomForest (ntree,  image, samples, bands, leaf){

  var classifier = ee.Classifier.smileRandomForest({
                    numberOfTrees: ntree,
                    minLeafPopulation: leaf
                    })
                    .train({
                      'features':samples,
                      'classProperty':'class',
                      'inputProperties': bands
                    })
                    // .setOutputMode('MULTIPROBABILITY');
                    .setOutputMode('PROBABILITY');

  var classified = image.classify(classifier);
  
  return classified//.multiply(100).byte()
}; 

// sampling and classifying
function classification (ntree, imgToClassify, samples, bands, leaf){
  
  // sampling points
  var samplePoints = imgToClassify.sampleRegions({
    collection: samples,//mbSamples, 
    properties: ['class'], 
    scale: 30, 
    geometries: true,
    tileScale: 4
  })
  
  // classifying
  var result = runRandomForest (ntree, imgToClassify, samplePoints, bands, leaf)
  
  return result
}

exports.classification = classification
