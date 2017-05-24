var express = require('express');
var sqlite3 = require('sqlite3');
var mustacheExpress = require('mustache-express');
var process = require('process');
var config = require('./config.js');

const NODE_ENV = process.env.NODE_ENV || 'production';
var db = new sqlite3.Database(config.dbPath);
var app = express();

var server = app.listen(8080, function () {
   var host = server.address().address;
   var port = server.address().port;
   console.log("listening at http://%s:%s", host, port);
});

app.engine('mustache', mustacheExpress());
app.set('view engine', 'mustache');

app.use('/static', express.static('app/public'));
app.set('views', 'app/mustache/');

app.get('/', function(req, res) {
    var bundleFile = NODE_ENV === 'production' ? 'bundle.min.js' : 'bundle.js';
    res.render('index.mustache', {bundle: bundleFile});
});

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
        GROUP BY id
        ORDER BY timestamp DESC) AS nd
        INNER JOIN sensor_location sl
        ON nd.id = sl.id
        ORDER BY sl.id`,
        function(err, rows) {
            if (err) {
                console.log(err);
            }
            res.json(rows);
        }
    );
});

app.get('/api/get', function(req, res) {
    let id = req.query.id;
    let page = req.query.page || '1';
    let perPage = req.query['per-page'] || '80';

    if (!isNormalInteger(id)) {
        res.status(400).send({
            msg: 'Invalid id'
        });
    }
    if (!isNormalInteger(page)) {
        res.status(400).json({
            msg: 'Invalid page'
        });
    }
    if (!isNormalInteger(perPage)) {
        res.status(400).json({
            msg: 'Invalid per-page'
        });
    }

    page = parseInt(page);
    perPage = parseInt(perPage);
    let offset = (page - 1) * perPage;

    db.all(
        `SELECT nd.mean AS mean,
        nd.timestamp AS timestamp
        FROM
        (SELECT id, mean, timestamp
        FROM no2_data
        WHERE id = $id
        ORDER BY timestamp DESC) AS nd
        INNER JOIN sensor_location sl
        ON nd.id = sl.id
        LIMIT $offset, $limit`,
        {
            $id: id,
            $offset: offset,
            $limit: perPage
        },
        function(err, rows) {
            if (err) {
                console.log(err);
            }
            res.json(rows);
        }
    );
});

function isNormalInteger(str) {
    var n = Math.floor(Number(str));
    return String(n) === str && n >= 0;
}
