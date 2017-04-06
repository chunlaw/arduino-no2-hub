var express = require('express');
var sqlite3 = require('sqlite3');
var config = require('./config.js');

var db = new sqlite3.Database(config.dbPath);
var app = express();

var server = app.listen(8080, function () {
   var host = server.address().address
   var port = server.address().port
   console.log("listening at http://%s:%s", host, port)
})

app.use('/static', express.static('app/public'))

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/app/index.html');
})

app.get('/api/list', function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    db.all(
        `SELECT sl.id AS id,
         nd.mean AS mean,
         nd.timestamp AS timestamp,
         sl.lat AS lat,
         sl.long AS long
         FROM
         (SELECT id, mean, timestamp
         FROM no2_data
         ORDER BY timestamp ASC) AS nd
         JOIN sensor_location sl
         ON sl.id = sl.id
         GROUP BY sl.id
         ORDER BY sl.id`,
        function(err, rows) {
            if (err) {
                console.log(err);
            }
            res.json(rows);
    });
});
