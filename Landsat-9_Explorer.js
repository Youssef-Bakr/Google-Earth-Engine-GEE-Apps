//a LandSat-9 Explorer
// A UI to interactively filter a collection, select an individual image
// from the results, display it with a variety of visualizations, and export it.
var app = {};
/** Creates the UI panels. */
app.createPanels = function() {
  /* The introduction section. */
  app.intro = {
    panel: ui.Panel([
      ui.Label({
        value: 'Landsat 9 Explorer',
        style: {fontWeight: 'bold', fontSize: '24px', margin: '10px 5px'}
      }),
      ui.Label('USGS Landsat 9 Collection 2 Tier 1 TOA Reflectance \n(Availability: 2021 >> 2023)\n' +
               '___________________________________________\n'+
               '\n(Youssef Bakr)(+201121121000) \n'+  
               '\n(www.linkedin.com/in/youssef-bakr) \n'+
               '___________________________________________\n'
               
               )
    ])
  };


  /* The collection filter controls. */
  app.filters = {
    mapCenter: ui.Checkbox({label: 'Filter to map center', value: true}),
    startDate: ui.Textbox('YYYY-MM-DD', '2023-06-01'),
    endDate: ui.Textbox('YYYY-MM-DD', '2023-06-08'),
    applyButton: ui.Button('Apply filters', app.applyFilters),
    loadingLabel: ui.Label({
      value: 'Loading...',
      style: {stretch: 'vertical', color: 'gray', shown: false}
    })
  };


  /* The panel for the filter control widgets. */
  app.filters.panel = ui.Panel({
    widgets: [
      ui.Label('1) Select filters', {fontWeight: 'bold'}),
      ui.Label('Start date', app.HELPER_TEXT_STYLE), app.filters.startDate,
      ui.Label('End date', app.HELPER_TEXT_STYLE), app.filters.endDate,
      app.filters.mapCenter,
      ui.Panel([
        app.filters.applyButton,
        app.filters.loadingLabel
      ], ui.Panel.Layout.flow('horizontal'))
    ],
    style: app.SECTION_STYLE
  });


  /* The image picker section. */
  app.picker = {
    // Create a select with a function that reacts to the "change" event.
    select: ui.Select({
      placeholder: 'Select an image ID',
      onChange: app.refreshMapLayer
    }),
    // Create a button that centers the map on a given object.
    centerButton: ui.Button('Center on map', function() {
      Map.centerObject(Map.layers().get(0).get('eeObject'));
    })
  };


  /* The panel for the picker section with corresponding widgets. */
  app.picker.panel = ui.Panel({
    widgets: [
      ui.Label('2) Select an image', {fontWeight: 'bold'}),
      ui.Panel([
        app.picker.select,
        app.picker.centerButton
      ], ui.Panel.Layout.flow('horizontal'))
    ],
    style: app.SECTION_STYLE
  });


  /* The visualization section. */
  app.vis = {
    label: ui.Label(),
    // Create a select with a function that reacts to the "change" event.
    select: ui.Select({
      items: Object.keys(app.VIS_OPTIONS),
      onChange: function() {
        // Update the label's value with the select's description.
        var option = app.VIS_OPTIONS[app.vis.select.getValue()];
        app.vis.label.setValue(option.description);
        // Refresh the map layer.
        app.refreshMapLayer();
      }
    })
  };


  /* The panel for the visualization section with corresponding widgets. */
  app.vis.panel = ui.Panel({
    widgets: [
      ui.Label('3) Select a visualization', {fontWeight: 'bold'}),
      app.vis.select,
      app.vis.label
    ],
    style: app.SECTION_STYLE
  });


  // Default the select to the first value.
  app.vis.select.setValue(app.vis.select.items().get(0));


};


/** Creates the app helper functions. */
app.createHelpers = function() {
  /**
   * Enables or disables loading mode.
   * @param {boolean} enabled Whether loading mode is enabled.
   */
  app.setLoadingMode = function(enabled) {
    // Set the loading label visibility to the enabled mode.
    app.filters.loadingLabel.style().set('shown', enabled);
    // Set each of the widgets to the given enabled mode.
    var loadDependentWidgets = [
      app.vis.select,
      app.filters.startDate,
      app.filters.endDate,
      app.filters.applyButton,
      app.filters.mapCenter,
      app.picker.select,
      app.picker.centerButton,
      //app.export.button
    ];
    loadDependentWidgets.forEach(function(widget) {
      widget.setDisabled(enabled);
    });
  };


  /** Applies the selection filters currently selected in the UI. */
  app.applyFilters = function() {
    app.setLoadingMode(true);
    var filtered = ee.ImageCollection(app.COLLECTION_ID);


    // Filter bounds to the map if the checkbox is marked.
    if (app.filters.mapCenter.getValue()) {
      filtered = filtered.filterBounds(Map.getCenter());
    }


    // Set filter variables.
    var start = app.filters.startDate.getValue();
    if (start) start = ee.Date(start);
    var end = app.filters.endDate.getValue();
    if (end) end = ee.Date(end);
    if (start) filtered = filtered.filterDate(start, end);


    // Get the list of computed ids.
    var computedIds = filtered
        .limit(app.IMAGE_COUNT_LIMIT)
        .reduceColumns(ee.Reducer.toList(), ['system:index'])
        .get('list');


    computedIds.evaluate(function(ids) {
      // Update the image picker with the given list of ids.
      app.setLoadingMode(false);
      app.picker.select.items().reset(ids);
      // Default the image picker to the first id.
      app.picker.select.setValue(app.picker.select.items().get(0));
    });
  };


  /** Refreshes the current map layer based on the UI widget states. */
  app.refreshMapLayer = function() {
    Map.clear();
    var imageId = app.picker.select.getValue();
    if (imageId) {
      // If an image id is found, create an image.
      var image = ee.Image(app.COLLECTION_ID + '/' + imageId);
      // Add the image to the map with the corresponding visualization options.
      var visOption = app.VIS_OPTIONS[app.vis.select.getValue()];
      Map.addLayer(image, visOption.visParams, imageId);
    }
  };
};


/** Creates the app constants. */
app.createConstants = function() {
  app.COLLECTION_ID = 'LANDSAT/LC09/C02/T1_TOA';
  app.SECTION_STYLE = {margin: '20px 0 0 0'};
  app.HELPER_TEXT_STYLE = {
      margin: '8px 0 -3px 8px',
      fontSize: '12px',
      color: 'gray'
  };
  app.IMAGE_COUNT_LIMIT = 10;
  //(www.usgs.gov/media/images/common-landsat-band-combinations)
  app.VIS_OPTIONS = {
    'Color Infra Red (CIR)(B5/B4/B3)': {
      description: 'Color Infra Red (CIR)(B5/B4/B3)(www.usgs.gov/media/images/common-landsat-band-combinations)',
      visParams: {gamma: 1.1, min: 0, max: 0.45, bands: ['B5', 'B4', 'B3']}
    },
     'False Color (Vegetation Analysis) (B6/B5/B4)': {
      description: 'False Color (Vegetation Analysis) (B6/B5/B4)(www.usgs.gov/media/images/common-landsat-band-combinations)',
      visParams: {gamma: 1.1, min: 0, max: 0.45, bands: ['B6', 'B5', 'B4']}
    },
      'False color Urban (B7/B6/B4)': {
      description: 'False color Urban (B7/B6/B4)(www.usgs.gov/media/images/common-landsat-band-combinations)',
      visParams: {gamma: 1.1, min: 0, max: 0.45, bands: ['B7', 'B6', 'B4']}
    },
     'Short Wave Infra Red (B7/B5/B4)': {
      description: 'Short Wave Infra Red (B7/B5/B4)(www.usgs.gov/media/images/common-landsat-band-combinations)',
      visParams: {gamma: 1.1, min: 0, max: 0.45, bands: ['B7', 'B5', 'B4']}
    },
    'Natural color (B4/B3/B2)': {
      description: 'Natural color (B4/B3/B2)(www.usgs.gov/media/images/common-landsat-band-combinations)',
      visParams: {gamma: 1.1, min: 0, max: 0.35, bands: ['B4', 'B3', 'B2']}
    },
    'Atmospheric (B7/B6/B5)': {
      description: 'Coast lines and shores are well-defined. ' +
                   'Vegetation appears blue.(www.usgs.gov/media/images/common-landsat-band-combinations)',
      visParams: {gamma: 1.1, min: 0, max: 0.45, bands: ['B7', 'B6', 'B5']}
    }
  };
};


/** Creates the application interface. */
app.boot = function() {
  app.createConstants();
  app.createHelpers();
  app.createPanels();
  var main = ui.Panel({
    widgets: [
      app.intro.panel,
      app.filters.panel,
      app.picker.panel,
      app.vis.panel,
      //app.export.panel
    ],
    style: {width: '320px', padding: '8px'}
  });
  Map.setCenter(30.16742, 30.1663, 10);
  ui.root.insert(0, main);
  app.applyFilters();
};


app.boot();


//Modified By Youssef Mohamed Bakr (www.linked.com/in/youssef-bakr)(+201121121000)
