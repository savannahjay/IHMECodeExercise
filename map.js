// Set up base map
let mapboxAccessToken = 'pk.eyJ1Ijoic2F2YW5uYWhqYXkiLCJhIjoiY2pwajI5bWh4MDI5dDNrczkzNjIzbnlsdCJ9.DN9HWckmGunFVtuNFFUakg';
let map = L.map('map').setView([0,0], 2);

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=' + mapboxAccessToken, {
    id: 'mapbox.light',
    attribution: 'Mapbox | IMHE Global Health Data 2018'
}).addTo(map);

// Initialize geodata object, start with shapes
const geodata = countryShapes.features;

// Create year data object
const data2017both = [];
data.forEach(entry => {
  if (entry.year == '2017' && entry.sex_id == '3') {
    data2017both.push(entry);
  }
});

// Merge data object with geoJSON countries
geodata.forEach(country => {
  data2017both.forEach(entry => {
    if (entry.location_name === country.properties.ADMIN) {
      country.properties.opioiddeathrate = entry.val;
    }
  })
});

// Color country shapes based on death rate data
function getColor(rate) {
  return "hsl(17,100%," + (rate*100) + "%)";
}
// Apply styles to data overlay
function style(geodata) {
  return {
    fillColor: getColor(geodata.properties.opioiddeathrate),
    weight: 1,
    opacity: 1,
    color: 'white',
    fillOpacity: 0.7
  };
}

let geojson;

function highlightFeature(e) {
  let layer = e.target;
  layer.setStyle({
    weight: 1,
    color: 'black'
  });
  dataViewer.update(layer.feature.properties);
}

function resetHighlight(e) {
  geojson.resetStyle(e.target);
  dataViewer.update();
}

// Add styled data layer to map
function onEachFeature(feature, layer) {
  layer.on({
    mouseover: highlightFeature,
    mouseout: resetHighlight
  });
}

geojson = L.geoJson(geodata, {
  style: style,
  onEachFeature: onEachFeature
}).addTo(map);

let dataViewer = L.control();

dataViewer.onAdd = function (map) {
  this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
  this.update();
  return this._div;
};

// method that we will use to update the control based on feature properties passed
dataViewer.update = function (props) {
  this._div.innerHTML = '<h4>Worldwide Rates of Opioid Deaths</h4>' + (props ?
    '<span>' + props.ADMIN + '</span><br />' + Math.round(100 * props.opioiddeathrate) / 100
    : 'Hover over a country to view data');
};

dataViewer.addTo(map);
