
/**
 * App dependencies
 */

var express = require('express'),
    app = express(),
    http = require('http'),
    path = require('path'),
    io = require('socket.io'),
    config = require('./config');

app.configure(function() {
    app.set('mode', config.env);
    app.set('port', config.port);
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.static(path.join(__dirname, 'public')));
});

var server = http.createServer(app);

var sio = io.listen(server, {
    'log level': 0
});

sio.sockets.on('connection', function(socket) {
    socket.on('bubble', function(data) {
        socket.broadcast.emit('bubble', data);
    });
});

server.listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port') + ' in ' + app.get('mode') + ' mode');
});