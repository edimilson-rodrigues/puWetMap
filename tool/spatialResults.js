// Main code developed to present spatial results
// The code must run on Google Earth Engine

// requires
var lyrs = require('users/ee-ers/puWetMap:vis/listsAndDicts.js')
var legends = require('users/ee-ers/puWetMap:vis/legends.js')

// --------------------------------------------
// setting the map grid and the main panel

// create a grid of maps
var maps = [];

var mapList = [
  // maps from 1985 to 2035
  0, 1, 2, 3, 4, 5, 6, 7, 8, 
  
  // legends
  9
  ]

mapList.forEach(function(n){
  
  var map = ui.Map()
      map.setOptions({mapTypeId: 'SATELLITE'})
      // map.setControlVisibility({all: false})
      map.setCenter(-47.888, -22.014, 12)
      maps.push(map)
  
})


var linker = ui.Map.Linker(maps);

// create a grid of map panels
var mapPanels = []

var listOfMapRows = [
  0
  // 0,1,2,3,4
  ], 
  nColumns = listOfMapRows.length

listOfMapRows.forEach(function(n){
  
  mapPanels.push(ui.Panel([
    maps[n], 
    // maps[n+nColumns]
    ], null, {stretch: 'both', border: '1px solid black'}))
  
})

// setting the map grid
var mapGrid = ui.Panel([
  ui.Label({
    value: 'Spatial results',
    style: {maxHeight: '40px', fontWeight: 'bold', textAlign: 'center', position: 'top-right', stretch: 'horizontal'}
  }),
  ui.Panel(
      mapPanels,
      ui.Panel.Layout.flow('horizontal', true), {stretch: 'both', border: '1px solid black'})
  ], 
  ui.Panel.Layout.flow('vertical', true), {border: '1px solid black', maxHeight: '16px', position: 'top-center'});

// main panel
var mainPanel = ui.Panel({
    widgets: [
      ui.Label({
        value:'Peri-urban wetlands analysis - São Paulo state, Brazil',
        style: {
          fontSize:14, fontWeight: 'bold', margin: '12px',
        }
    }),           // panel title
    ui.Label(''), // run panel
    ui.Label(''), // lulc panel
    ui.Label(''), // cn panel
    ui.Label(''), // qf panel
    ui.Label(''), // condition panel
    ui.Label(''), // watersheds segments 
    ui.Label(''), // wetlands areas
    ui.Label(''), // reference panel
    ],
  style: {
      width: '400px',
    }
  })

// --------------------------------------------
// formatting syles
var suptitlesStyle = {
  textAlign: 'left',
  fontSize: '12px',
  fontWeight: 'bold',
  margin: '10px',
  // backgroundColor: '#f0f0f0',
}

var supPanelTitlesStyle = {
  textAlign: 'left',
  fontSize: '12px',
  fontWeight: 'bold',
  margin: '10px',
  backgroundColor: '#f0f0f0',
}

var supPanelStyle = {
  margin: '4px 2px 4px 4px', 
  backgroundColor: '#f0f0f0',
  // width: '190px'
}

var supPanelStyle2 = {
  margin: '4px 2px 4px 4px', 
  backgroundColor: '#f0f0f0',
  width: '150px'
}

// --------------------------------------------
// panel for select sub-region
var selectSubRegion = ui.Select({
  items: lyrs.srNames,
  placeholder: 'Select one sub-region', 
  onChange: null, 
  // value: '1 - Ribeirão Preto',
  style: {
    width: '300px', 
    textAlign: 'center', 
    margin: '4px 2px 4px 4px', 
    position: 'top-center'
    }
  })

// print(selectSubRegion.getValue())

var runButtom = ui.Button({
  label: 'Run', 
  onClick: function (){
    
    if (selectSubRegion.getValue() == null){
      
      
    } else {
    
      var srName = selectSubRegion.getValue()
      
      var sr = ee.Dictionary(lyrs.srNamesToNumberDict).get(srName)
      
      addLayersBySubRegion (sr)
    }
  }, 
  style: {
    width: '60', 
    textAlign: 'center', 
    margin: '4px 4px 4px 2px', 
    position: 'top-center' 
  }
})

var runPanel = ui.Panel({
  widgets: [
    ui.Label({
      value: 'Select a sub-region and click in run', 
      style: suptitlesStyle
    }),
    selectSubRegion,
    runButtom
    ], 
  layout: ui.Panel.Layout.flow('horizontal', true), 
  // style
})

mainPanel.widgets().set(1, runPanel)

// ----- start sub-panels
var mapbiomaslink = ui.Label(
  'MapBiomas', 
  {whiteSpace: 'nowrap'}, 
  'https://brasil.mapbiomas.org/en/');

var terrsetLink = ui.Label(
  'TerrSet',
  {whiteSpace: 'nowrap'}, 
  'https://github.com/ClarkCGA/TerrSet')

var invest = ui.Label(
  'InVEST',
  {whiteSpace: 'nowrap'}, 
  'https://naturalcapitalproject.stanford.edu/software/invest/invest-models')

var reference = ui.Panel({
  widgets: [
    ui.Label({
      value: 'Land use and land cover maps from 1985 to 2020 were adapted \
      from MapBiomas project, Collection 6. \
      The LULC for 2035 was projected using Land Change Modeler (LCM) (TerrSet software).\
      The CN and QF were calculated using InVEST software (version 3.9.2).\
      Links are provided below.',
      style: {stretch: 'horizontal', width: '350px', margin: '10px',}
      }),
    mapbiomaslink,
    terrsetLink,
    invest
  ], 
  style:{margin: '10px',}
})

mainPanel.widgets().set(8, reference)

// lulc panel
var lulcPanel = ui.Panel({
  widgets: [
    ui.Label({value: 'Land use land cover', style: supPanelTitlesStyle}),
    ui.Label(''), 
    ui.Label(''), 
    ui.Label(''), 
    ui.Label(''), 
    ui.Label(''), 
    ui.Label(''), 
    ui.Label(''), 
    ui.Label(''), 
    ui.Label(''),
  ],
  layout: ui.Panel.Layout.flow('vertical', true),
  style: supPanelStyle2,
})

// panel for lulc and its legend
var lulcWithLegend = ui.Panel({
  widgets: [
    lulcPanel,
    legends.legendPanel
    ],
  layout: ui.Panel.Layout.flow('horizontal', true),
  style: supPanelStyle,
})

// lulc years
var years = [1985, 1990, 1995, 2000, 2005, 2010, 2015, 2020, 2035]
var positions = [0,1,2,3,4,5,6,7,8]

//----------
// cn panels
var cnPanel = ui.Panel({
  widgets: [
    ui.Label({value: 'Curve Number (CN)', style: supPanelTitlesStyle}),
    ui.Label(''), 
    ui.Label(''), 
    ui.Label(''), 
    ui.Label(''), 
    ui.Label(''), 
    ui.Label(''), 
    ui.Label(''), 
    ui.Label(''), 
  ],
  layout: ui.Panel.Layout.flow('vertical', true),
  style: supPanelStyle2,
})

var cnLegend = legends.fixedMiniLegend (
  "Legend",// title 
  5,//min 
  95,//max 
  lyrs.colorsCN
  )

// panel for lulc and its legend
var cnWithLegend = ui.Panel({
  widgets: [
    cnPanel,
    cnLegend
    ],
  layout: ui.Panel.Layout.flow('horizontal', true),
  style: supPanelStyle,
})

// lulc years
var yearsCn = [
  1985, 1990, 1995, 2000, 2005, 2010, 2015, 2020, 
  // 2035
  ]

var positionsCn = [
  0,1,2,3,4,5,6,7,
  // 8
  ]
  
// qf panels
var qfPanel = ui.Panel({
  widgets: [
    ui.Label({value: 'Quickflow (QF)', style: supPanelTitlesStyle}),
    ui.Label(''), 
    ui.Label(''), 
    ui.Label(''), 
    ui.Label(''), 
    ui.Label(''), 
    ui.Label(''), 
    ui.Label(''), 
    ui.Label(''), 
  ],
  layout: ui.Panel.Layout.flow('vertical', true),
  style: supPanelStyle2,
})

var qfLegend = legends.fixedMiniLegend (
  "Legend [mm]",// title 
  0,//min 
  1400,//max 
  lyrs.colorsQF
  )

// panel for lulc and its legend
var qfWithLegend = ui.Panel({
  widgets: [
    qfPanel,
    qfLegend
    ],
  layout: ui.Panel.Layout.flow('horizontal', true),
  style: supPanelStyle,
})

// condition panels
var conditionPanel = ui.Panel({
  widgets: [
    ui.Label({value: 'Classification score', style: supPanelTitlesStyle}),
    ui.Label(''), 
  ],
  layout: ui.Panel.Layout.flow('vertical', true),
  style: supPanelStyle2,
})

var conditionLegend = legends.fixedMiniLegend (
  "Legend",// title 
  0,//min 
  100,//max 
  lyrs.colorsCondition
  )

// panel for lulc and its legend
var contitionWithLegend = ui.Panel({
  widgets: [
    conditionPanel,
    conditionLegend
    ],
  layout: ui.Panel.Layout.flow('horizontal', true),
  style: supPanelStyle,
})

// feature collections layer
var fcPanel = ui.Panel({
  widgets: [
    ui.Label({value: 'Selected drainage areas', style: supPanelTitlesStyle}),
    ui.Label(''), 
  ],
  layout: ui.Panel.Layout.flow('vertical', true),
  style: supPanelStyle2,
})

var watershedsVis = {
  color: 'white', 
  fillColor: '#f0f0f0', 
  width: 1, 
  // lineType: 'solid'
};

var fcLegend = legends.featureCollectionLegend (watershedsVis, 'Drainage areas')

var fcWithLegend = ui.Panel({
  widgets: [
    fcPanel,
    fcLegend
    ],
  layout: ui.Panel.Layout.flow('horizontal', true),
  style: supPanelStyle,
})

// wetlands layer
var wcPanel = ui.Panel({
  widgets: [
    ui.Label({value: 'Selected wetlands areas', style: supPanelTitlesStyle}),
    ui.Label(''), 
  ],
  layout: ui.Panel.Layout.flow('vertical', true),
  style: supPanelStyle2,
})

var wcLegend = legends.featureCollectionLegend (lyrs.wetvis, 'Wetlands')

var wcWithLegend = ui.Panel({
  widgets: [
    wcPanel,
    wcLegend
    ],
  layout: ui.Panel.Layout.flow('horizontal', true),
  style: supPanelStyle,
})


function centerMap (sr){
  maps[0].centerObject(lyrs.roisNumbered.filter(ee.Filter.eq('sr', sr)), 12)
}

// conditional variable
var subPanel = 0

function addLayersBySubRegion (sr){
  
  // center the map
  centerMap (sr)
  
  // cleaning the map
  maps[0].layers().reset()
  
  // // cleaning the panels
  // mainPanel.widgets().set(2, ui.Label(''))// lulc
  
  // add the land use and land cover 
  positions.forEach(function (position){
    
    // cleaning sub panels
    lulcPanel.widgets().set(position+1, ui.Label(''))
    
    // adding a checkbox by year
    lyrs.checkBoxByYearAndSubregion (years[position], sr, lulcPanel, position+1, maps[0], 'lulc')
    
  })
  
  // add cn 
  positionsCn.forEach(function (position){
    
    // cleaning sub panels
    cnPanel.widgets().set(position+1, ui.Label(''))
    
    // lyrs.checkBoxByYearAndSubregion (year, sr, lulcPanel, maps[0])
    lyrs.checkBoxByYearAndSubregion (yearsCn[position], sr, cnPanel, position+1, maps[0], 'cn')
    
  })
  
  // add qf 
  positionsCn.forEach(function (position){
    
    // cleaning sub panels
    qfPanel.widgets().set(position+1, ui.Label(''))
    
    // lyrs.checkBoxByYearAndSubregion (year, sr, lulcPanel, maps[0])
    lyrs.checkBoxByYearAndSubregion (yearsCn[position], sr, qfPanel, position+1, maps[0], 'qf')
    
  })
  
  // cleaning sub panels
  conditionPanel.widgets().set(1, ui.Label(''))
  
  // lyrs.checkBoxByYearAndSubregion (year, sr, lulcPanel, maps[0])
  lyrs.checkBoxByYearAndSubregion ('From 1985 to 2020', sr, conditionPanel, 1, maps[0], 'condition')
  
  
  //--------------------
  // subwatersheds areas
  fcPanel.widgets().set(1, ui.Label(''))
  
  // lyrs.checkBoxByYearAndSubregion (year, sr, lulcPanel, maps[0])
  lyrs.checkBoxByYearAndSubregion ('Drainage areas (official dataset)', sr, fcPanel, 1, maps[0], 'watersheds')
  
  //--------------------
  // wetlands areas
  wcPanel.widgets().set(1, ui.Label(''))
  
  // lyrs.checkBoxByYearAndSubregion (year, sr, lulcPanel, maps[0])
  lyrs.checkBoxByYearAndSubregion ('Wetlands flaggeg by soil types', sr, wcPanel, 1, maps[0], 'wetlands')
  
  // condition to add panels only one time
  if (subPanel==0){
    
    // flag a conditional variable
    subPanel = 1
    
    // add the lulc
    mainPanel.widgets().set(2, lulcWithLegend)
    
    // add the cn to main panel
    mainPanel.widgets().set(3, cnWithLegend)
    
    // add the qf to main panel
    mainPanel.widgets().set(4, qfWithLegend)
    
    // add the qf to main panel
    mainPanel.widgets().set(5, contitionWithLegend)
    
    // add the fc to main panel
    mainPanel.widgets().set(6, fcWithLegend)
    
    // add the fc to main panel
    mainPanel.widgets().set(7, wcWithLegend)
    
  }
  
}



// --------------------------------------------
ui.root.clear();
ui.root.add(ui.SplitPanel(mainPanel, mapGrid));
