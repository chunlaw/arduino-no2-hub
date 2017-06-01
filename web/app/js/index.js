require('!style-loader!css-loader!../css/style.css');
import axios from 'axios';
import Chart from 'chart.js';
import Vue from 'vue';
import constants from './constants.js';

const COLORS = constants.COLORS;
const MIN = unitConversion(constants.MIN);
const MAX = unitConversion(constants.MAX);
const REFRESH_INTERVAL = constants.REFRESH_INTERVAL;
const PAGE_SIZE = constants.PAGE_SIZE;

let ctx = document.getElementById('chart');
let chartObj = null;
ctx.style.display = 'none';
let mapObj;
let selectedId = '';
let markers = [];

function initMap() {
    mapObj = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 22.340880, lng: 114.114522},
        zoom: 11
    });
    updateMapMarkers();
    setInterval(function() {
        updateMapMarkers();
        if (selectedId) {
            updateChart(selectedId);
        }
    }, REFRESH_INTERVAL * 1000);
}

function updateMapMarkers() {
    axios.get('/api/list').then(function(res) {
        for (let i in markers) {
            let marker = markers[i];
            marker.setMap(null);
        }
        markers = [];
        for (let i in res.data) {
            let data = res.data[i];
            let mean = unitConversion(data.mean);
            let colorIndex = Math.floor(
                COLORS.length * (mean - MIN) / (MAX - MIN)
            );
            let marker = new google.maps.Marker({
                position: {lat: data.lat, lng: data.long},
                map: mapObj,
                label: new google.maps.Point(0, 30),
                icon: {
                    fillColor: getColor(data.mean).bg,
                    fillOpacity: 0.9,
                    path: 'M-20 -10 L20 -10 L20 10 L4 10 L0 20 L-4 10 L-20 10 Z'
                },
                label: {
                    color: getColor(data.mean).fg,
                    fontWeight: 'bold',
                    text: '' + data.mean.toFixed(2)
                }
            });
            marker.addListener('click', function(id) {
                return function() {
                    selectedId = id;
                    updateChart(id);
                };
            }(data.id));
            markers.push(marker);
        }
    });
}

function updateChart(id) {
    var pageSize = PAGE_SIZE;
    axios.get('/api/get?id=' + id + '&page=1&per-page=' + pageSize).then(function(res) {
        ctx.style.display = 'block';

        let data = res.data.reverse();
        chartObj && chartObj.destroy();
        chartObj = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.map(function(a){ return getTimeDisplay(a.timestamp); }),
                datasets: [{
                    data: data.map(function(a){
                        return unitConversion(a.mean).toFixed(3);
                    }),
                    backgroundColor: data.map(function(a){ return getColor(unitConversion(a.mean)).bg; })
                }]
            },
            options: {
                legend: {
                    display: false
                },
                tooltips: {
                    displayColors: false,
                    callbacks: {
                        label: function(item, data) {
                            return item.yLabel;
                        }
                    }
                },
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero:true,
                            max: MAX
                        }
                    }]
                }
            }
        });
    });
}

function getColor(i) {
    let colorIndex = Math.floor(
        COLORS.length * (i - MIN) / (MAX - MIN)
    );
    let color = COLORS[colorIndex];
    return color ? color : constants.DEFAULT_COLOR;
}

function addLeadingZeros(number, zeroCount) {
    number = '' + number;
    return '0'.repeat(zeroCount).slice(0, zeroCount - number.length) + number;
}

function getTimeDisplay(timestamp) {
    let dateTime = new Date(timestamp * 1000);
    let second = addLeadingZeros(dateTime.getSeconds(),2);
    let minute = addLeadingZeros(dateTime.getMinutes(), 2);
    let hour = addLeadingZeros(dateTime.getHours(), 2);
    let day = addLeadingZeros(dateTime.getDate(), 2);
    let month = addLeadingZeros(dateTime.getMonth() + 1, 2);
    let year = dateTime.getFullYear();
    return `${day}-${month}-${year} ${hour}:${minute}:${second}`;
}

function unitConversion(value) {
    if (constants.UNIT === 'ug/m3') {
        return value * 1800;
    }
    return value;
}

new Vue({
    el: '#panel',
    data: {
        show: false
    },
    computed: {
        panelClass: function() {
            return {
                'panel-show': this.show,
                'panel-hide': !this.show
            };
        }
    }
});

window.initMap = initMap;
