var static = require('node-static');
var http = require('http');
var file = new (static.Server)();
var app = http.createServer(function (req, res) {
    file.serve(req, res);
}).listen(8181);

var io = require('socket.io').listen(app);

io.sockets.on('connection', function (socket) {
    socket.on('message', function (message) {
        log('S --> Got message: ', message);
        switch (message.technology) {
            case "WebSocket":
                // Ajoutez votre logique spécifique à WebSocket ici
                break;
            case "XHR":
                // Ajoutez votre logique spécifique à XHR ici
                break;
            default:
                console.log("Unsupported technology for sending messages.");
                break;
        }
    });

    socket.on('create or join', function (message) {
        var numClients = io.sockets.clients(message.channel).length;
        console.log('numclients = ' + numClients);
        if (numClients == 0) {
            socket.join(message.channel);
            socket.emit('created', message.channel);
        } else if (numClients == 1) {
            io.sockets.in(message.channel).emit('remotePeerJoining', message.channel);
            socket.join(message.channel);
            socket.broadcast.to(message.channel).emit('broadcast: joined', 'S --> broadcast(): client ' +
                socket.id + ' joined channel ' + message.channel);
        } else {
            console.log("Channel full!");
            socket.emit('full', message.channel);
        }
    });

    socket.on('response', function (response) {
        log('S --> Got response: ', response);
        switch (response.technology) {
            case "WebSocket":
                
                break;
            case "XHR":
                
                break;
            default:
                console.log("Unsupported technology for sending responses.");
                break;
        }
    });

    socket.on('Bye', function (channel) {
        socket.broadcast.to(channel).emit('Bye');
        socket.disconnect();
    });

    socket.on('Ack', function () {
        console.log('Got an Ack!');
        socket.disconnect();
    });

    function log() {
        var array = [">>> "];
        for (var i = 0; i < arguments.length; i++) {
            array.push(arguments[i]);
        }
        socket.emit('log', array);
    }
});