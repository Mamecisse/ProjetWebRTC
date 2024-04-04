var startButton = document.getElementById("startButton");
var sendButton = document.getElementById("sendButton");
var closeButton = document.getElementById("closeButton");
var connection;
var ws;

startButton.disabled = false;
sendButton.disabled = true;
closeButton.disabled = true;

startButton.onclick = createWebSocketConnection;
sendButton.onclick = sendData;
closeButton.onclick = closeWebSocketConnection;

function createConnection() {
    var selectedTechnology = document.getElementById("technologySelect").value;

    if (selectedTechnology === "WebSocket") {
        createWebSocketConnection();
    } else if (selectedTechnology === "XHR") {
        createXHRConnection();
    }

}

function createWebSocketConnection() {
    ws = new WebSocket("ws://localhost:8181");

    ws.onopen = function() {
        console.log("WebSocket connection established.");
        startButton.disabled = true;
        sendButton.disabled = false;
        closeButton.disabled = false;
    };

    ws.onmessage = function(event) {
        
    };

    ws.onclose = function() {
        console.log("WebSocket connection closed.");
        startButton.disabled = false;
        sendButton.disabled = true;
        closeButton.disabled = true;
    };
}


function createXHRConnection() {
    
}

function sendData() {
    
     var data = document.getElementById("dataChannelSend").value;
     
     if (connection && connection.readyState === WebSocket.OPEN) {
        connection.send(data);
    } else {
        console.log("Connection not established or closed.");
    }
    
}

function closeWebSocketConnection() {
    if (connection) {
        connection.close();
    }
}