var fs = require('fs');
var express = require('express');

var app = express();
    app.post('/', function (req, res, next) {
        req.pipe(fs.createWriteStream('./uploadFile'));
        req.on('end', next);
    });

    app.listen(3000);