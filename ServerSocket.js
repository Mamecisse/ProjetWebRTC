const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8181 });

const clients = new Set();
wss.on('connection', function connection(ws) {
	clients.add(ws);
    ws.on('message', function incoming(message) {
        clients.forEach(client => {
            client.send(message);
        });
    });

    ws.on('close', function() {
		clients.delete(ws);
        console.log('WebSocket connection closed.');
    });
});