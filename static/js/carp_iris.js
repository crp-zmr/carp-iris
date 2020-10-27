var streetMap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    hash: true,
    scrollZoom: true,
    id: "mapbox/streets-v11",
    accessToken: API_KEY
});

d3.csv("static/data/carp_members.csv", function(data){

    // Create a new marker cluster group
    var carp = L.markerClusterGroup({spiderfyOnMaxZoom:false,
        disableClusteringAtZoom: 18,
        polygonOptions: {
            color: '#045BA7',
            weight: 4,
            opacity: 1,
            fillOpacity: 0.5
        },

        iconCreateFunction: function(cluster) {
            var count = cluster.getChildCount();
            
            var digits = (count+'').length;
    
            return new L.DivIcon({
                html: count,
                className:'cluster digits-'+digits,
                iconSize: null
            });
        },});

        var carpIcon = new L.Icon({
            iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        });

    // Loop through data
    for (var i = 0; i < data.length; i++) {
    // Add a new marker to the cluster group and bind a pop-up
    carp.addLayer(L.marker([data[i].lat, data[i].lng], {icon: carpIcon}));
    }
    
    d3.csv("static/data/IRIS_Store_List_latlng.csv", function(data){
        
    // Create a new marker cluster group
    var markers = L.markerClusterGroup({
	spiderfyOnMaxZoom: true,
	showCoverageOnHover: true,
	zoomToBoundsOnClick: true,
	singleMarkerMode: false,
        disableClusteringAtZoom: 18,
        polygonOptions: {
            color: '#2d84c8',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.5
        },

        iconCreateFunction: function(cluster) {
            var count = cluster.getChildCount();
            
            var digits = (count+'').length;
    
            return new L.DivIcon({
                html: count,
                className:'cluster2 digits-'+digits,
                iconSize: null
            });
        },});

        var irisIcon = L.ExtraMarkers.icon({
            icon: 'fas fa-eye',
            shape: 'square',
            markerColor: 'orange',
            prefix: 'fa',
            iconColor: 'white'
        });
    
    // Loop through data
    for (var i = 0; i < data.length; i++) {
        markers.addLayer(L.marker([data[i].lat, data[i].lng], {icon: irisIcon})
        );
    }
    
    createMap(carp, markers)
    })
});

function createMap(carp, markers){
    var baseMaps = {
    "Street Map": streetMap
};

var overlayMaps = {
    "IRIS Stores": markers,
    "CARP Members": carp
};

var mymap = L.map("map", {
    center: [53.0221996, -89.859165],
    zoom: 4.4,
    layers: [streetMap, carp, markers]
}); 

var RADIUS = 15000;
var filterCircle = L.circle(L.latLng(53.0221996, -89.859165), RADIUS, {
    opacity: 0.5,
    weight: 1,
    fillOpacity: 0.1
}).addTo(mymap);

var csvLayer = omnivore.csv('static/data/IRIS_Store_List_latlng.csv', null, L.mapbox.featureLayer())
    .addTo(mymap);

mymap.on('mousemove', function(e) {
    filterCircle.setLatLng(e.latlng);
    csvLayer.setFilter(function showIRIS(feature) {
        return e.latlng.distanceTo(L.latLng(
                feature.geometry.coordinates[1],
                feature.geometry.coordinates[0])) < RADIUS;
    });
});

L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
}).addTo(mymap);
}