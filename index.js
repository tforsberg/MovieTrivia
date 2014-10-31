﻿var express = require('express');
var path = require('path');
var app = express();
var mg = require('./server');

app.configure(function () {
    app.use(express.logger('dev'));
    app.use(express.static(path.join(__dirname, 'public')));
});

var server = require('http').createServer(app).listen(8888);
var io = require('socket.io').listen(server);

io.set('log level', 1);

io.sockets.on('connection', function (socket) {

    mg.initGame(io, socket);
});
