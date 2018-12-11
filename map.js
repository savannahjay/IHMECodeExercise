// load countries object from JSON file
let request = new XMLHttpRequest();
request.open('GET', '/data/countries.geo.json', true);
request.onload = function() {
  if (request.status >= 200 && request.status < 400) {
    // save to countries object
    let countries = JSON.parse(request.responseText);
  } else {
    console.log('Error: ' + request.responseText);
  }
};
request.onerror = function() {
  console.log('Error: ' + request.responseText);
};
request.send();

let mapboxAccessToken = 'pk.eyJ1Ijoic2F2YW5uYWhqYXkiLCJhIjoiY2pwajI5bWh4MDI5dDNrczkzNjIzbnlsdCJ9.DN9HWckmGunFVtuNFFUakg';
let map = L.map('map').setView([0,0], 2);

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=' + mapboxAccessToken, {
    id: 'mapbox.light',
    attribution: 'Mapbox | IMHE Global Health Data 2018'
}).addTo(map);

L.geoJson(countries).addTo(map);

// let map = L.map('mapid').setView([0,0], 3);
