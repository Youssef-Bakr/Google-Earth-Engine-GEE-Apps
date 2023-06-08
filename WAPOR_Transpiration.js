//2023-06-08_WAPOR-Transpiration_v02
////////////////////////////////////////////////////////////////////////////////////////////////
var countries = ee.FeatureCollection('USDOS/LSIB_SIMPLE/2017');
var roi = ee.Feature(countries.filter(ee.Filter.inList('country_na',
   ['Egypt']
  )).union().first()).geometry().bounds(); // get bounds to simplify geometry
////////////////////////////////////////////////////////////////////////////////////////////////
var Vis = {
  min: 0.0,
  max: 50.0,
  palette: ['black','yellow','orange','magenta','blue'],
  
}
var coll = ee.ImageCollection('FAO/WAPOR/2/L1_T_D');
//var image = coll.first();
//var image = coll.filterDate('2023-02-01','2023-03-14');
var image = coll.filterDate('2023-02-11');
Map.setCenter(30, 30, 7);
Map.setOptions('HYBRID');
Map.addLayer(image, Vis,'Transpiration [mm] _ (WAPOR-FAO-UN');
// ----------------------------------------------------------------------------------------
// Create a panel to hold label widgets on the left 
var panel = ui.Panel();
panel.style().set('width', '600px');
// ----------------------------------------------------------------------------------------
// Add the panel to the ui.root.
ui.root.insert(0, panel);
// ----------------------------------------------------------------------------------------
// Label-01
var Label01 = ui.Label(
  {value: 'WAPOR Transpiration\n(Dataset Provider: FAO UN)\n',style: {fontSize: '20px', fontWeight: 'bold'},}
                      );
panel.widgets().set(1, Label01);                      
// ----------------------------------------------------------------------------------------
// Label-02
var Label02 = ui.Label('Date: (2023-02-11)', {whiteSpace: 'pre'});
panel.widgets().set(2, Label02);
// ----------------------------------------------------------------------------------------
// Label-03
var Label03 = ui.Label('Bands:  (Name: L1_T_D)(Units: mm)(Scale: 0.1)(Resolution: 248.2 meters)', {whiteSpace: 'pre'});
panel.widgets().set(3, Label03);
// ----------------------------------------------------------------------------------------
// Label-04
var Label04 = ui.Label('Palette:  (Black  >  Yellow  >  Orange  >  Magenta  >  Blue)', {whiteSpace: 'pre'});
panel.widgets().set(4, Label04);
//label of auth
 var Label05 = ui.Label('Youssef Mohamed Bakr\nPhone: +201121121000\nwww.linkedin.com/in/youssef-bakr', {whiteSpace: 'pre'});
panel.widgets().set(5, Label05);
// ----------------------------------------------------------------------------------------
//Modeified By: Youssef Mohamed Bakr (+201121121000)

/*


WAPOR Dekadal Transpiration




FAO/WAPOR/2/L1_T_D
Dataset Availability
2009-01-01T00:00:00Z–2023-02-11T00:00:00
Dataset Provider
FAO UN
Earth Engine Snippet
ee.ImageCollection("FAO/WAPOR/2/L1_T_D") 
Tags
agriculture fao wapor water




Resolution
248.2 meters


Bands


Name        Units        Scale        Description
L1_T_D        mm        0.1        Transpiration (Dekadal) [mm]


Citations:
FAO 2018. WaPOR Database Methodology: Level 1. Remote Sensing for Water Productivity Technical Report: Methodology Series. Rome, FAO. 72 pages.


FAO 2020. WaPOR V2 Database Methodology. Remote Sensing for Water Productivity Technical Report: Methodology Series. Rome, FAO. (in press)
*/

