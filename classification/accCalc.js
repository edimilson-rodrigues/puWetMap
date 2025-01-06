// Additional resource to calculate accuracy and plot based on samples proportion

// functions to calc acc
function accCalcByRange (imgToEvaluate, list, validationSamples){
  
  function accCalc (threshold){
      
      // filter samples below a specified random threshold
      var validationPoints = validationSamples
          .filter(ee.Filter.lte('random', threshold))
      
      // get the classification value for each point
      var samplingValPoints = imgToEvaluate.gte(50).unmask()
          .sampleRegions({
            collection: validationPoints, 
            properties: ['class'], 
            scale: 30, 
            tileScale: 6, 
            geometries: false
          })
      
      // error matrix
      var errorMatrix = samplingValPoints.errorMatrix('class', 'classification')
      
      // consumers accuracy
      var consumersAcc = errorMatrix.consumersAccuracy()
      // print(consumersAcc)
      
      // productors accuracy
      var producersAcc = errorMatrix.producersAccuracy()
      // print(producersAcc)
      
    return ee.Feature(null)
    .set('threshold', threshold)
    .set('overall_acc', errorMatrix.accuracy())
    .set('consumers_acc_0', consumersAcc.get([0,0]))
    .set('consumers_acc_1', consumersAcc.get([0,1]))
    .set('producers_acc_0', producersAcc.get([0,0]))
    .set('producers_acc_1', producersAcc.get([1,0]))
  }
  
  // do the math
  var ftColToChart = ee.FeatureCollection(list.map(accCalc))
  
  return ftColToChart
  
}

// print(accCalcByRange (imgToEvaluate, list, validationSamples))

function chartAcc (ftColToChart){
  
  // Define the chart and print it to the console.
  var chart1 =
    ui.Chart.feature
      .byFeature({
        features: ftColToChart,
        xProperty: 'threshold',
        yProperties: ['overall_acc'],
      })
      .setSeriesNames(['Overall acc.'])
      .setOptions({
        title: 'Overall accuracy',
        series: {
          0: {
            targetAxisIndex: 0, 
            type: 'line',
            lineWidth: 0,
            pointSize: 10,
            color: '1d6b99'
          },
          1: {
            targetAxisIndex: 0,
            type: 'line',
            lineWidth: 0,
            pointSize: 10,
            color: 'e37d05'
          },
          2: {
            targetAxisIndex: 0,
            type: 'line',
            lineWidth: 0,
            pointSize: 10,
            color: 'bcbddc'
          }
        },
        hAxis:
            {title: 'Samples proportion (%)', titleTextStyle: {italic: false, bold: true}},
        vAxes: {
          viewWindow: {min: 0.5, max: 10},
          // title: 'Accuracy',
          0: {
            // title: 'OA',
            baseline: 0,
            titleTextStyle: {italic: false, bold: true, color: '1d6b99'}
          },
          1: {
            title: 'PA',
            titleTextStyle: {italic: false, bold: true, color: 'e37d05'}
          },
          2: {
            title: 'UA',
            titleTextStyle: {italic: false, bold: true, color: 'bcbddc'}
          },
        },
      });
  
  // print(chart);
  
  // Define the chart and print it to the console.
  var chart2 =
    ui.Chart.feature
      .byFeature({
        features: ftColToChart,
        xProperty: 'threshold',
        yProperties: ['producers_acc_1', 'consumers_acc_1'],//, 'consumers_acc', 'producers_acc']
      })
      .setSeriesNames(['PA', 'UA'])
      .setOptions({
        title: 'Acc. to class 1 (positive trends)',
        series: {
          0: {
            targetAxisIndex: 0, 
            type: 'line',
            lineWidth: 0,
            pointSize: 10,
            color: '1d6b99'
          },
          1: {
            targetAxisIndex: 0,
            type: 'line',
            lineWidth: 0,
            pointSize: 10,
            color: 'e37d05'
          },
          2: {
            targetAxisIndex: 0,
            type: 'line',
            lineWidth: 0,
            pointSize: 10,
            color: 'bcbddc'
          }
        },
        hAxis:
            {title: 'Samples proportion (%)', titleTextStyle: {italic: false, bold: true}},
        vAxes: {
          viewWindow: {min: 0.5, max: 10},
          // title: 'Accuracy',
          0: {
            // title: 'OA',
            baseline: 0,
            titleTextStyle: {italic: false, bold: true, color: '1d6b99'}
          },
          1: {
            title: 'PA',
            titleTextStyle: {italic: false, bold: true, color: 'e37d05'}
          },
          2: {
            title: 'UA',
            titleTextStyle: {italic: false, bold: true, color: 'bcbddc'}
          },
        },
      });
  
  // print(chart);
  
  // Define the chart and print it to the console.
  var chart3 =
    ui.Chart.feature
      .byFeature({
        features: ftColToChart,
        xProperty: 'threshold',
        yProperties: ['producers_acc_0', 'consumers_acc_0'],//, 'consumers_acc', 'producers_acc']
      })
      .setSeriesNames(['PA', 'UA'])
      .setOptions({
        title: 'Acc. to class 0 (negative trends)',
        series: {
          0: {
            targetAxisIndex: 0, 
            type: 'line',
            lineWidth: 0,
            pointSize: 10,
            color: '1d6b99'
          },
          1: {
            targetAxisIndex: 0,
            type: 'line',
            lineWidth: 0,
            pointSize: 10,
            color: 'e37d05'
          },
          2: {
            targetAxisIndex: 0,
            type: 'line',
            lineWidth: 0,
            pointSize: 10,
            color: 'bcbddc'
          }
        },
        hAxis:
            {title: 'Samples proportion (%)', titleTextStyle: {italic: false, bold: true}},
        vAxes: {
          viewWindow: {min: 0.5, max: 10},
          // title: 'Accuracy',
          0: {
            // title: 'OA',
            baseline: 0,
            titleTextStyle: {italic: false, bold: true, color: '1d6b99'}
          },
          1: {
            title: 'PA',
            titleTextStyle: {italic: false, bold: true, color: 'e37d05'}
          },
          2: {
            title: 'UA',
            titleTextStyle: {italic: false, bold: true, color: 'bcbddc'}
          },
        },
      });
  
  // print(chart);
  
  return [chart1, chart2, chart3]
}

function chartFc (ftColToChart){

  // Define the chart and print it to the console.
  var chart1 =
    ui.Chart.feature
      .byFeature({
        features: ftColToChart,
        xProperty: 'size',
        yProperties: ['acc'],
      })
      .setSeriesNames(['Overall acc.'])
      .setOptions({
        title: 'Overall accuracy',
        series: {
          0: {
            targetAxisIndex: 0, 
            type: 'line',
            lineWidth: 0,
            pointSize: 10,
            color: '1d6b99'
          },
        },
        hAxis:
            {title: 'Samples size', titleTextStyle: {italic: false, bold: true}},
        vAxes: {
          viewWindow: {min: 0.5, max: 10},
          // title: 'Accuracy',
          0: {
            // title: 'OA',
            baseline: 0,
            titleTextStyle: {italic: false, bold: true, color: '1d6b99'}
          },
        },
      });
}

exports.accCalcByRange = accCalcByRange
exports.chartAcc = chartAcc
exports.chartFc = chartFc

// var ftColToChart = accCalcByRange (imgToEvaluate, list, validationSamples)

// var charts = chartAcc (ftColToChart)

// print(charts[0], charts[1], charts[2])
