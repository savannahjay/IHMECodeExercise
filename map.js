// Data class to generate annual data objects
class AnnualData {
  constructor(year) {
    // Construct object in geoJSON, start with country geometry
    this.type = 'FeatureCollection';
    this.features = countryShapes.features;
    // Assign year
    this.year = year;
    this.annualdata = [];
  }
  addDeathRate(data) {
    // Add death rate data to features array
    // Create array with matching year data only
    data.forEach(entry => {
      if (entry.year == this.year) {
        this.annualdata.push(entry);
      }
    });
    // Add matching year data to geoJSON features object
    this.features.forEach(country => {
      this.annualdata.forEach(entry => {
        if (entry.location_name === country.properties.ADMIN && entry.sex_id === 3) {
          country.properties.overallrate = entry.val;
          country.properties.overallu = entry.upper;
          country.properties.overalll = entry.lower;
        } else if (entry.location_name === country.properties.ADMIN && entry.sex_id === 1) {
          country.properties.malerate = entry.val;
          country.properties.maleu = entry.upper;
          country.properties.malel = entry.lower;
        } else if (entry.location_name === country.properties.ADMIN && entry.sex_id === 2) {
          country.properties.femalerate = entry.val;
          country.properties.femaleu = entry.upper;
          country.properties.femalel = entry.lower;
        }
      })
      if (!country.properties.overallrate) {
        country.properties.overallrate = 'No Data';
        country.properties.overallu = 'No Data';
        country.properties.overalll = 'No Data';
      }
    });
  }
}

// Create initial instance & display on map
const data2017 = new AnnualData(2017);
data2017.addDeathRate(data);
console.log(data2017.features[237]);

const data2016 = new AnnualData(2016);
data2016.addDeathRate(data);
console.log(data2017.features[237]);

// MAP BUILDING FUNCTIONS
// Set up base map
let mapboxAccessToken = 'pk.eyJ1Ijoic2F2YW5uYWhqYXkiLCJhIjoiY2pwajI5bWh4MDI5dDNrczkzNjIzbnlsdCJ9.DN9HWckmGunFVtuNFFUakg';
let baseMap = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=' + mapboxAccessToken, {
    id: 'mapbox.light',
    attribution: 'Mapbox | IMHE Global Health Data 2018'
});

function buildMapLayer(current) {
  // Color country shapes based on death rate data:
  function getColor(rate) {
    if (typeof rate === 'number') {
      return "hsl(17,100%," + (100 - rate * 6) + "%)";
    } else {
      return "white";
    }
  }
  // Apply styles to data overlay
  function style(current) {
    return {
      fillColor: getColor(current.properties.overallrate),
      weight: 1,
      opacity: 1,
      color: 'white',
      fillOpacity: 0.7
    };
  }
  // Set up choropleth map with hover styles
  let geojson;

  function highlightFeature(e) {
    let layer = e.target;
    layer.setStyle({
      weight: 1,
      color: 'black'
    });
    // dataViewer.update(layer.feature.properties);
  }

  function resetHighlight(e) {
    geojson.resetStyle(e.target);
    // dataViewer.update();
  }

  function onEachFeature(feature, layer) {
    layer.on({
      click: highlightFeature,
      mouseover: highlightFeature,
      mouseout: resetHighlight
    });
    layer.bindPopup(
      '<div class="dataviewer-country">' +
      feature.properties.ADMIN +
      '</div><div class="dataviewer-info"><p class="overall">' +
      ( typeof feature.properties.overallrate === 'number' ?
        Math.round(100 * feature.properties.overallrate) / 100 + '%</p>' +
          '<p class="range">' + Math.round(100 * feature.properties.overalll) / 100 + '% - ' + Math.round(100 * feature.properties.overallu) / 100 + '%</p>' +
          '<p class="two-col dataviewer-sexdata">Male:<br/> ' + Math.round(100 * feature.properties.malerate) / 100 + '%</p>' +
          '<p class="two-col dataviewer-sexdata">Female:<br/> ' + Math.round(100 * feature.properties.femalerate) / 100 + '%</p>'
          : feature.properties.overallrate )
      + '</div>'
    );
  }

  geojson = L.geoJson(current, {
    style: style,
    onEachFeature: onEachFeature
  });

  return geojson;
}

let map = L.map('map',{
  layers: [baseMap,buildMapLayer(data2017)]
}).setView([0,0], 2);

let overlayMaps = {
    "2017": buildMapLayer(data2017),
    "2016": buildMapLayer(data2016)
};

L.control.layers(overlayMaps).addTo(map);

// Add data pane to map view
// let dataViewer = L.control();
//
// dataViewer.onAdd = function (map) {
//   this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
//   this.update();
//   return this._div;
// };
//
// dataViewer.update = function (props) {
//   this._div.innerHTML = '<h2>Worldwide Rates of Opioid Deaths</h2>' + (props ?
//     '<div class="dataviewer-country">' + props.ADMIN + '</div><div class="dataviewer-info"><p class="overall">' +
//     (typeof props.overallrate === 'number' ?
//       Math.round(100 * props.overallrate) / 100 + '%</p>' +
//       '<p>' + Math.round(100 * props.overalll) / 100 + '% - ' + Math.round(100 * props.overalll) / 100 + '%</p>' +
//       '<p class="two-col dataviewer-sexdata">Male: ' + Math.round(100 * props.malerate) / 100 + '%</p>' +
//       '<p class="two-col dataviewer-sexdata">Female: ' + Math.round(100 * props.femalerate) / 100 + '%</p></div>'
//       : props.overallrate + '</div>')
//     : 'Click or hover over a country to view data');
// };
//
// dataViewer.addTo(map);
