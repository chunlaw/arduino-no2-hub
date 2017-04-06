require("!style-loader!css-loader!./style.css");
import Vue from 'vue';
import axios from 'axios';

var mapObj;
function initMap() {
    mapObj = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 22.340880, lng: 114.114522},
        zoom: 11
    });

    axios.get('/api/list').then(function(res) {
        console.log(res.data);
        for (var i in res.data) {
            var data = res.data[i];
            var marker = new google.maps.Marker({
                position: {lat: data.lat, lng: data.long},
                map: mapObj,
                title: '' + data.mean
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
