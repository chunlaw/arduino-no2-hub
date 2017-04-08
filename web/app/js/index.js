require("!style-loader!css-loader!../css/style.css");
import Vue from 'vue';
import axios from 'axios';

const COLORS = [
    {bg: 'green', fg: 'white'},
    {bg: 'yellow', fg: 'black'},
    {bg: 'orange', fg: 'black'},
    {bg: 'red', fg: 'white'},
    {bg: 'purple', fg: 'white'},
    {bg: 'black', fg: 'white'}
];
const MIN = 0.23;
const MAX = 0.34;

var mapObj;
function initMap() {
    mapObj = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 22.340880, lng: 114.114522},
        zoom: 11
    });

    axios.get('/api/list').then(function(res) {
        for (var i in res.data) {
            var data = res.data[i];
            var colorIndex = Math.floor(
                COLORS.length * (data.mean - MIN) / (MAX - MIN)
            );
            var marker = new google.maps.Marker({
                position: {lat: data.lat, lng: data.long},
                map: mapObj,
                label: new google.maps.Point(0, 30),
                icon: {
                    fillColor: COLORS[colorIndex].bg,
                    fillOpacity: 0.9,
                    path: "M-20 -10 L20 -10 L20 10 L4 10 L0 20 L-4 10 L-20 10 Z"
                },
                label: {
                    color: COLORS[colorIndex].fg,
                    fontWeight: 'bold',
                    text: '' + data.mean.toFixed(2)
                }
            });
        }
    });
}

new Vue({
    el: '#app',
    data: {
        'message': 'OMG'
    }
});

window.initMap = initMap;
