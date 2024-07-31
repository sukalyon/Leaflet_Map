var map = L.map('map').setView([51.505, -0.09], 10);

// Define the base layers
var openStreetMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
 maxZoom: 17,
 attribution: '© OpenStreetMap'
});


var openTopoMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    maxZoom: 17,
    attribution: '© OpenTopoMap'
});


map.on('layeradd layerremove', function () {
    var bounds = new L.LatLngBounds();
    map.eachLayer(function (layer) {
        if (layer instanceof L.FeatureGroup) {
            bounds.extend(layer.getBounds());
        }
    });

    if (bounds.isValid()) {
        map.fitBounds(bounds);
    } else {
        map.fitWorld();
    }
});


// Define the overlay layers
var aScenario = new L.FeatureGroup([
  new L.Marker([38.01372, 39.8881]).bindPopup('A Scenario Marker 1'),
  new L.Marker([37.01538, 42.1694]).bindPopup('A Scenario Marker 2'),
  new L.Marker([36.25781, 39.2561]).bindPopup('A Scenario Marker 3'),
]);

// Add rectangle polygon to the FeatureGroup
L.rectangle([
    [38.49906596404472, 38.33653523670128], // Southwest corner
    [35.4512513386467, 43.36930390470792]  // Northeast corner
]).addTo(aScenario);

var bScenario = new L.FeatureGroup([
 new L.Marker([39.81557926336049, 29.617432333479684]).bindPopup('B Scenario Marker 1'),
 new L.Marker([39.568194252016724, 30.00322365295699]).bindPopup('B Scenario Marker 2'),
 new L.Marker([39.591792915885804, 29.675607214988617]).bindPopup('B Scenario Marker 3'),
 new L.Marker([39.83909348986259, 29.695509148136352]).bindPopup('B Scenario Marker 4')
]);

L.rectangle([
    [40.04801538244641, 29.17805888629769], // Southwest corner
    [39.31163251439486, 30.32318550125268]  // Northeast corner
]).addTo(bScenario);

// Add the default base layer to the map
openStreetMap.addTo(map);



// Define base layers and overlays for the control
var baseLayers = {
    "OpenStreet Map": openStreetMap,
    "OpenTopo Map": openTopoMap
};

var overlays = {
    "A Senaryosu": aScenario,
    "B Senaryosu": bScenario
};

// Add the layer control to the map
L.control.layers(baseLayers, overlays).addTo(map);

// // Define the tree structure
// var baseTree = {
//     label: 'Base Layers',
//     children: [
//         { label: 'OpenStreet Map', layer: openStreetMap },
//         { label: 'Topographic Map', layer: openTopoMap }
//     ]
// };

// var overlayTree = {
//     label: 'Senaryolar',
//     children: [
//         { label: 'A Senaryosu', layer: aScenario },
//         { label: 'B Senaryosu', layer: bScenario }
//     ]
// };

// var ctl = L.control.layers.tree(baseTree, overlayTree).addTo(map);



// Custom CursorHandler
L.CursorHandler = L.Handler.extend({
    initialize: function(map) {
        this._map = map;
    },
    
    addHooks: function () {
        this._popup = new L.Popup();
        this._map.on('mouseover', this._open, this);
        this._map.on('mousemove', this._update, this);
        this._map.on('mouseout', this._close, this);
    },

    removeHooks: function () {
        this._map.off('mouseover', this._open, this);
        this._map.off('mousemove', this._update, this);
        this._map.off('mouseout', this._close, this);
    },
    
    _open: function (e) {
        this._update(e);
        this._popup.openOn(this._map);
    },

    _close: function () {
        this._map.closePopup(this._popup);
    },

    _update: function (e) {
        this._popup.setLatLng(e.latlng)
            .setContent(e.latlng.toString());
    }
});

// Instantiate and add CursorHandler to the map
map.addHandler('cursor', L.CursorHandler);
map.cursor.enable();

// Kullanıcıdan koordinatları al ve poligon çiz
function drawPolygon() {
    var input = document.getElementById('coords').value;
    var coordPairs = input.split(',');
    var polygonCoords = [];

    for (var i = 0; i < coordPairs.length; i += 2) {
        var lat = parseFloat(coordPairs[i]);
        var lng = parseFloat(coordPairs[i + 1]);
        polygonCoords.push([lat, lng]);
    }

    // Önceki poligonu temizleme
    if (window.polygon) {
        map.removeLayer(window.polygon);
    }

    // Poligon oluşturma ve haritaya ekleme
    window.polygon = L.polygon(polygonCoords, {
        color: 'blue',
        fillColor: 'blue',
        fillOpacity: 0.4
    }).addTo(map);

    // Haritayı poligonun merkezine yakınlaştırma
    map.fitBounds(window.polygon.getBounds());

    // Poligon tıklama olayını ekle
    window.polygon.on('click', function (e) {
        if (selectedArea) {
            selectedArea.setStyle({ color: 'blue' });
            distancePolylines.forEach(function(polyline) {
                map.removeLayer(polyline);
            });
            distancePolylines = [];
        }

        selectedArea = e.target;
        selectedArea.setStyle({ color: 'red' });

        var latlngs = selectedArea.getLatLngs()[0];
        for (var i = 0; i < latlngs.length; i++) {
            var nextIndex = (i + 1) % latlngs.length;
            var distance = latlngs[i].distanceTo(latlngs[nextIndex]) / 1000;

            var midPoint = [
                (latlngs[i].lat + latlngs[nextIndex].lat) / 2,
                (latlngs[i].lng + latlngs[nextIndex].lng) / 2
            ];

            var polyline = L.polyline([latlngs[i], latlngs[nextIndex]], { color: 'blue' }).addTo(map);
            polyline.bindTooltip(distance.toFixed(2) + ' km', { permanent: true, className: "distance-tooltip" }).openTooltip(midPoint);
            distancePolylines.push(polyline);
        }
    });
}

