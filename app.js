var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    path = require('path');

app.configure(function() {
    app.use(express.static(path.join(__dirname, 'public')));
});

/*
app.get('/', function(req, res) {
    res.sendfile(__dirname + '/public/index.html');
});
*/

io.sockets.on('connection', function(socket) {
    socket.emit('news', {
        hello : 'world'
    });
    socket.on('my other event', function(data) {
        console.log(data);
    });
});

server.listen(8080);
