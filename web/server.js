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
})

app.engine('mustache', mustacheExpress());
app.set('view engine', 'mustache');

app.use('/static', express.static('app/public'));
app.set('views', 'app/mustache/')

app.get('/', function(req, res) {
    var bundleFile = NODE_ENV === 'production' ? 'bundle.min.js' : 'bundle.js';
    res.render('index.mustache', {bundle: bundleFile});
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

    if (id == 1) {
        res.json([
            {mean: 0.3380, timestamp: 1491374761},
            {mean: 0.2681, timestamp: 1491376161},
            {mean: 0.2776, timestamp: 1491371128},
            {mean: 0.2425, timestamp: 1491371636},
            {mean: 0.2367, timestamp: 1491372980},
            {mean: 0.3097, timestamp: 1491377604},
            {mean: 0.3314, timestamp: 1491373967},
            {mean: 0.2646, timestamp: 1491376201},
            {mean: 0.3025, timestamp: 1491379637},
            {mean: 0.2736, timestamp: 1491372060},
            {mean: 0.3212, timestamp: 1491378500},
            {mean: 0.2928, timestamp: 1491375946},
            {mean: 0.3064, timestamp: 1491375655},
            {mean: 0.2630, timestamp: 1491373651},
            {mean: 0.2646, timestamp: 1491374200},
            {mean: 0.3314, timestamp: 1491377278},
            {mean: 0.2321, timestamp: 1491377067},
            {mean: 0.3072, timestamp: 1491379820},
            {mean: 0.2700, timestamp: 1491371715},
            {mean: 0.3218, timestamp: 1491373446},
            {mean: 0.2754, timestamp: 1491371274},
            {mean: 0.3378, timestamp: 1491373240},
            {mean: 0.2714, timestamp: 1491378812},
            {mean: 0.2981, timestamp: 1491373047},
            {mean: 0.2852, timestamp: 1491378660},
            {mean: 0.2370, timestamp: 1491373261},
            {mean: 0.2450, timestamp: 1491371716},
            {mean: 0.3060, timestamp: 1491378302},
            {mean: 0.3349, timestamp: 1491375749},
            {mean: 0.3151, timestamp: 1491378004},
            {mean: 0.3380, timestamp: 1491374761},
            {mean: 0.2681, timestamp: 1491376161},
            {mean: 0.2776, timestamp: 1491371128},
            {mean: 0.2425, timestamp: 1491371636},
            {mean: 0.2367, timestamp: 1491372980},
            {mean: 0.3097, timestamp: 1491377604},
            {mean: 0.3314, timestamp: 1491373967},
            {mean: 0.2646, timestamp: 1491376201},
            {mean: 0.3025, timestamp: 1491379637},
            {mean: 0.2736, timestamp: 1491372060},
            {mean: 0.3212, timestamp: 1491378500},
            {mean: 0.2928, timestamp: 1491375946},
            {mean: 0.3064, timestamp: 1491375655},
            {mean: 0.2630, timestamp: 1491373651},
            {mean: 0.2646, timestamp: 1491374200},
            {mean: 0.3314, timestamp: 1491377278},
            {mean: 0.2321, timestamp: 1491377067},
            {mean: 0.3072, timestamp: 1491379820},
            {mean: 0.2700, timestamp: 1491371715},
            {mean: 0.3218, timestamp: 1491373446},
            {mean: 0.2754, timestamp: 1491371274},
            {mean: 0.3378, timestamp: 1491373240},
            {mean: 0.2714, timestamp: 1491378812},
            {mean: 0.2981, timestamp: 1491373047},
            {mean: 0.2852, timestamp: 1491378660},
            {mean: 0.2370, timestamp: 1491373261},
            {mean: 0.2450, timestamp: 1491371716},
            {mean: 0.3060, timestamp: 1491378302},
            {mean: 0.3349, timestamp: 1491375749},
            {mean: 0.3151, timestamp: 1491378004},
            {mean: 0.3380, timestamp: 1491374761},
            {mean: 0.2681, timestamp: 1491376161},
            {mean: 0.2776, timestamp: 1491371128},
            {mean: 0.2425, timestamp: 1491371636},
            {mean: 0.2367, timestamp: 1491372980},
            {mean: 0.3097, timestamp: 1491377604},
            {mean: 0.3314, timestamp: 1491373967},
            {mean: 0.2646, timestamp: 1491376201},
            {mean: 0.3025, timestamp: 1491379637},
            {mean: 0.2736, timestamp: 1491372060},
            {mean: 0.3212, timestamp: 1491378500},
            {mean: 0.2928, timestamp: 1491375946},
            {mean: 0.3064, timestamp: 1491375655},
            {mean: 0.2630, timestamp: 1491373651},
            {mean: 0.2646, timestamp: 1491374200},
            {mean: 0.3314, timestamp: 1491377278},
            {mean: 0.2321, timestamp: 1491377067},
            {mean: 0.3072, timestamp: 1491379820},
            {mean: 0.2700, timestamp: 1491371715},
            {mean: 0.3218, timestamp: 1491373446}
        ]);
        return;
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
        ORDER BY timestamp ASC) AS nd
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
