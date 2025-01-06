/*
vegetation indices
*/

// Functions to calculate indexes
var calcNDVI = function(image) {
  var out = image.expression(
  '(NIR - RED) / (NIR + RED)',{ 
      'NIR': image.select('NIR'),  
      'RED': image.select('RED')});
  return out.rename('NDVI');
};

// Calculate EVI
var calcEVI = function(image) {
 var out = image.expression(
    '2.5 * ((NIR - RED) / (NIR + 6 * RED - 7.5 * BLUE + 1))',{ 
      'NIR': image.select('NIR'),  
      'BLUE': image.select('BLUE'),
      'RED': image.select('RED')});
  return out.rename('EVI');
};

// Calculate EVi2
var calcEVI2 = function(image) {
 var out = image.expression(
    '2.5 * ((NIR - RED) / (NIR + 2.4 * RED + 1))',{ 
      'NIR': image.select('NIR'), 
      'RED': image.select('RED')});
  return out.rename('EVI2');
};


/*
Water indices
*/

// Calculate MNDWI
var calcMNDWI = function(image) { //Xu, 2005 (https://doi.org/10.1080/01431160600589179)
  var out = image.expression(
  '(GREEN - SWIR1) / (GREEN + SWIR1)',{ 
      'GREEN': image.select('GREEN'), 
      'SWIR1': image.select('SWIR1')});
  return out.rename('MNDWI');
};

// Calculate NDWIm
var calcNDWIm = function(image) { //McFeeters, 1996 (https://doi.org/10.1080/01431169608948714) 
  var out = image.expression(
  '(GREEN - NIR) / (GREEN + NIR)',{ 
      'GREEN': image.select('GREEN'), 
      'NIR': image.select('NIR')});
  return out.rename('NDWIm');
};

// Calculate NDMI
var calcNDMI = function(image) {
  var out = image.expression(
  '(NIR - SWIR1) / (NIR + SWIR1)',{ 
      'SWIR1': image.select('NIR'), 
      'NIR': image.select('NIR')});
      
  return out.rename('NDMI');
};

/*
wetland indices (mangroove)
*/

// Calculate MMRI
var calcMMRI = function(image){//https://www.mdpi.com/2072-4292/11/7/808
  var out = image.expression(
  '(abs(MNDWI) - abs(NDVI))/(abs(MNDWI) + abs(NDVI))', {
    'MNDWI': image.select('MNDWI'), 
    'NDVI': image.select('NDVI')});
  return out.rename('MMRI')
};

/*
bare soils and imperviousness indices
*/

// Calculate UI
var calcUI = function(image){
  var out = image.expression(
  '(SWIR2 - NIR) / (SWIR2 + NIR)',{ 
      'SWIR2': image.select('SWIR2'), 
      'NIR': image.select('NIR')});
  return out.rename('UI');
};

// Calculate IBI
var calcIBI = function(image){
  var out = image.expression(
  '((2*SWIR1 / (SWIR1 + NIR)) - (NIR/(NIR+RED)+GREEN/(GREEN+SWIR1)))/ ((2*SWIR1 / (SWIR1 + NIR)) + (NIR/(NIR+RED)+GREEN/(GREEN+SWIR1)))',{ 
      'SWIR1': image.select('SWIR1'), 
      'RED': image.select('RED'), 
      'NIR': image.select('NIR'), 
      'GREEN': image.select('GREEN')});
  return out.rename('IBI');
};

// Calculate NDBSI
var calcNDBSI = function(image){
  
  // calc k
  var k = image.expression(
  '(1-(SWIR1-NIR)/(3*abs(NIR-RED)))*(RED-GREEN)',{
      'SWIR1': image.select('SWIR1'),
      'NIR': image.select('NIR'),
      'RED': image.select('RED'),
      'GREEN': image.select('GREEN'),
  })
  
  // if k > 0
  var outKpositive = image.expression(
    '(SWIR1 - BLUE)/(SWIR1 + BLUE)',{
        'SWIR1': image.select('SWIR1'),
        'BLUE': image.select('BLUE'),
    }).rename('NDBSI')
  
  // print(k)
  
  // if k < 0
  var outKnegative = outKpositive.expression(
    '-abs(NDBSI)',{
      'NDBSI': outKpositive.select('NDBSI')
    }).rename('NDBSI')
  
  var out = k.where(k.gte(0), outKpositive)
             .where(k.lt(0), outKnegative)

  return out.rename('NDBSI');
};


// Exports
// vegetagion indices
exports.calcNDVI = calcNDVI;
exports.calcEVI = calcEVI;
exports.calcEVI2 = calcEVI2;

// water indices
exports.calcMNDWI = calcMNDWI;
exports.calcNDWIm = calcNDWIm;
exports.calcNDMI = calcNDMI;

// wetland indices
exports.calcMMRI = calcMMRI

// bare soils and imperviousness indices
exports.calcUI = calcUI;
exports.calcIBI = calcIBI;
exports.calcNDBSI = calcNDBSI;
