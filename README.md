# IMHECodeExercise

## Intro
I created a choropleth visualization of the data, in order to highlight the geographic variability and make it easy to interpret at a glance. There are two dimensions to explore and compare &mdash; sex and year &mdash; which help the user build understanding of the populations most affected by opioid use disorders.

## Process and Tools
The visualization uses Leaflet.js with Mapbox tiles. I referred to the Leaflet documentation and tutorials (particularly GeoJSON, Layers, and Choropleth) to build the map. I used an open source geoJSON object collection to create the country shapes. I also converted the CSV data to JSON.

## Improving the Visualization
In accordance with Agile development principles, it's important to deliver a working product quickly, and to reflect and evaluate at every release to make continuous incremental improvements. With that in mind, a few specific improvements I would make with further development:
1. Use XHR or another method to parse JSON data objects rather than "hard-coding" into variables (make the files true JSON, not Javascript).
2. Fix layer control selection for default data layer.
3. Improve mobile/touch experience (enlarge layer selection with CSS).
4. Refactor geojson layers for loading speed; each data dimension uses a unique copy of the countries' geometry, which is likely not the most efficient way to create the data overlays.
5. Combine year and sex data into single map with multiple controls so that the user can explore previous years of male/female/combined rate data.
6. Use timeline/time dimension Leaflet plugin to create "animation" of chronological data and more intuitive switching between year datasets (something like https://github.com/skeate/Leaflet.timeline).
