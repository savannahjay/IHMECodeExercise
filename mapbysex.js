// load countries object from JSON file
let requestCountries = new XMLHttpRequest();
requestCountries.open('GET', 'https://savannahjay.github.io/IMHECodeExercise/data/countries.geo.json', true);
requestCountries.onload = function() {
  if (requestCountries.status >= 200 && requestCountries.status < 400) {
    // save to countries object
    let countryShapes = JSON.parse(requestCountries.responseText);
  } else {
    console.log('Error: ' + requestCountries.responseText);
  }
};
requestCountries.onerror = function() {
  console.log('Error: ' + requestCountries.responseText);
};
requestCountries.send();

// load data object from JSON file
let requestData = new XMLHttpRequest();
requestData.open('GET', 'https://savannahjay.github.io/IMHECodeExercise/data/data.json', true);
requestData.onload = function() {
  if (requestData.status >= 200 && requestData.status < 400) {
    // save to countries object
    let data = JSON.parse(requestData.responseText);
  } else {
    console.log('Error: ' + requestData.responseText);
  }
};
requestData.onerror = function() {
  console.log('Error: ' + requestData.responseText);
};
requestData.send();

// Data class to generate annual data objects
class DataBySex {
  constructor(sex) {
    // Construct object in geoJSON, start with country geometry
    this.type = 'FeatureCollection';
    // Copying countryShapes data for geometry
    this.features = JSON.parse(JSON.stringify(countryShapes.features));
    // Assign year
    this.sex = sex;
    this.sexdata = [];
  }
  addDeathRate(data) {
    // Add death rate data to features array
    // Create array with matching sex data only
    data.forEach(entry => {
      if (entry.year === 2017 && entry.sex_name === this.sex) {
        this.sexdata.push(entry);
      }
    });
    // Add matching year data to geoJSON features object
    this.features.forEach(country => {
      this.sexdata.forEach(entry => {
        if (entry.location_name === country.properties.name) {
          country.properties.overallrate = entry.val;
          country.properties.overallu = entry.upper;
          country.properties.overalll = entry.lower;
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
const databoth = new DataBySex('Both');
databoth.addDeathRate(data);

const datamale = new DataBySex('Male');
datamale.addDeathRate(data);

const datafemale = new DataBySex('Female');
datafemale.addDeathRate(data);

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
      fillOpacity: 1
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
  }

  function resetHighlight(e) {
    geojson.resetStyle(e.target);
  }

  function onEachFeature(feature, layer) {
    layer.on({
      click: highlightFeature,
      mouseover: highlightFeature,
      mouseout: resetHighlight
    });
    layer.bindPopup(
      '<div class="dataviewer-country">' +
      feature.properties.name +
      '</div><div class="dataviewer-info"><p class="overall">' +
      ( typeof feature.properties.overallrate === 'number' ?
        Math.round(100 * feature.properties.overallrate) / 100 + '%</p>' +
          '<p class="range">' + Math.round(100 * feature.properties.overalll) / 100 + '% - ' + Math.round(100 * feature.properties.overallu) / 100 + '%</p>'
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
  layers: [baseMap, buildMapLayer(databoth)]
}).setView([0,0], 2);

let overlayMaps = {
    "Both": buildMapLayer(databoth),
    "Male": buildMapLayer(datamale),
    "Female": buildMapLayer(datafemale)
};

L.control.layers(overlayMaps, null, {
  collapsed: false
}).addTo(map);
