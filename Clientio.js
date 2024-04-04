var sendChannel, receiveChannel;
var startButton = document.getElementById("startButton");
var sendButton = document.getElementById("sendButton");
var closeButton = document.getElementById("closeButton");
var selectedTechnology;
var connection;

startButton.disabled = false;
sendButton.disabled = true;
closeButton.disabled = true;
startButton.onclick = createConnection;
sendButton.onclick = sendData;
closeButton.onclick = closeDataChannels;

function log(text) {
	console.log("At time: " + (performance.now() /
1000).toFixed(3) +
" --> " + text);
}


function createConnection() {
    
    var selectedTechnology = document.getElementById("technologySelect").value;

    
    switch (selectedTechnology) {
        case "WebSocket":
          var ws = new WebSocket("ws://localhost:8181");
            console.log("WebSocket connection created.");
            
            break;
        case "XHR":
			var xhr = new XMLHttpRequest();
           
            console.log("XHR connection created.");
            
            break;
        case "WebRTC":
            
            if (navigator.webkitGetUserMedia) {
                RTCPeerConnection = webkitRTCPeerConnection;
            } else if (navigator.mozGetUserMedia) {
                RTCPeerConnection = mozRTCPeerConnection;
                RTCSessionDescription = mozRTCSessionDescription;
                RTCIceCandidate = mozRTCIceCandidate;
            }
            console.log("WebRTC connection created.");
            var servers = null;
            var pc_constraints = {
                'optional': [
                    { 'DtlsSrtpKeyAgreement': true }
                ]
            };
            var localPeerConnection = new RTCPeerConnection(servers, pc_constraints);
            log("Created local peer connection object, with Data Channel");
            try {
                var sendChannel = localPeerConnection.createDataChannel("sendDataChannel", { reliable: true });
                log('Created reliable send data channel');
            } catch (e) {
                alert('Failed to create data channel!');
                log('createDataChannel() failed with following message: ' + e.message);
            }
            localPeerConnection.onicecandidate = gotLocalCandidate;
    sendChannel.onopen = handleSendChannelStateChange;
    sendChannel.onclose = handleSendChannelStateChange;

    window.remotePeerConnection = new RTCPeerConnection(servers, pc_constraints);
    log('Created remote peer connection object, with DataChannel');
    remotePeerConnection.onicecandidate = gotRemoteIceCandidate;
    remotePeerConnection.ondatachannel = gotReceiveChannel;

    localPeerConnection.createOffer(gotLocalDescription, onSignalingError);
    startButton.disabled = true;
    closeButton.disabled = false;
            break;
        default:
            console.log("Unsupported technology selected.");
            break;
    }
}


function onSignalingError(error, selectedTechnology) {
    switch (selectedTechnology) {
        case "WebSocket":
            console.log('WebSocket signaling error: ' + error.name);
            break;
        case "XHR":
            console.log('XHR signaling error: ' + error.name);
            break;
        case "WebRTC":
            console.log('WebRTC signaling error: ' + error.name);
            break;
        default:
            console.log('Unsupported technology for signaling error handling.');
            break;
    }
}

function onSignalingError(error) {
	console.log('Failed to create signaling message : ' + 
error.name);
}

function sendData(selectedTechnology) {
    var data = document.getElementById("dataChannelSend").value;
    
    switch (selectedTechnology) {
        case "WebSocket":
            
            break;
        case "XHR":
            
            break;
        case "WebRTC":
            if (sendChannel && sendChannel.readyState === "open") {
                sendChannel.send(data);
                log('Sent data: ' + data);
            } else {
                console.log("Data channel not open or closed.");
            }
            break;
        default:
            console.log("Unsupported technology for sending data.");
            break;
    }
}

function closeDataChannels(selectedTechnology) {
    log('Closing data channels');
    
    switch (selectedTechnology) {
        case "WebSocket":
           
            break;
        case "XHR":
            
            break;
        case "WebRTC":
            if (sendChannel) {
                sendChannel.close();
                log('Closed send data channel with label: ' + sendChannel.label);
            }
            if (receiveChannel) {
                receiveChannel.close();
                log('Closed receive data channel with label: ' + receiveChannel.label);
            }
            if (localPeerConnection) {
                localPeerConnection.close();
                localPeerConnection = null;
            }
            if (remotePeerConnection) {
                remotePeerConnection.close();
                remotePeerConnection = null;
            }
            log('Closed peer connections');
            break;
        default:
            console.log("Unsupported technology for closing data channels.");
            break;
    }
    
    startButton.disabled = false;
    sendButton.disabled = true;
    closeButton.disabled = true;
    dataChannelSend.value = "";
    dataChannelReceive.value = "";
    dataChannelSend.disabled = true;
    dataChannelSend.placeholder = "1: Press Start; 2: Enter text; 3: Press Send.";
}


function gotLocalDescription(desc) {
	localPeerConnection.setLocalDescription(desc);
    log('localPeerConnection\'s SDP: \n' + desc.sdp);
    remotePeerConnection.setRemoteDescription(desc);
    remotePeerConnection.createAnswer(gotRemoteDescription,onSignalingError);
}

function gotRemoteDescription(desc) {
	remotePeerConnection.setLocalDescription(desc);
    log('Answer from remotePeerConnection\'s SDP: \n' + 
    desc.sdp);
    localPeerConnection.setRemoteDescription(desc);
}

function gotLocalCandidate(event) {
	log('local ice callback');
    if (event.candidate) {
		remotePeerConnection.addIceCandidate(event.candidate);
        log('Local ICE candidate: \n' + 
event.candidate.candidate);
    }
}

function gotRemoteIceCandidate(event) {
	log('remote ice callback');
    if (event.candidate) {
		localPeerConnection.addIceCandidate(event.candidate);
        log('Remote ICE candidate: \n ' + 
event.candidate.candidate);
     }
}

function gotReceiveChannel(event) {
	log('Receive Channel Callback: event --> ' + event);
    receiveChannel = event.channel;
    receiveChannel.onopen = handleReceiveChannelStateChange;
    receiveChannel.onmessage = handleMessage;
    receiveChannel.onclose = handleReceiveChannelStateChange;
}

function handleMessage(event) {
	log('Received message: ' + event.data);
    document.getElementById("dataChannelReceive").value = 
    event.data;
    document.getElementById("dataChannelSend").value = '';
}

function handleSendChannelStateChange() {
	var readyState = sendChannel.readyState;
    log('Send channel state is: ' + readyState);
    if (readyState == "open") {
		dataChannelSend.disabled = false;
        dataChannelSend.focus();
        dataChannelSend.placeholder = "";
        sendButton.disabled = false;
        closeButton.disabled = false;
} else {
	dataChannelSend.disabled = true;
    sendButton.disabled = true;
    closeButton.disabled = true;
    }
}

function handleReceiveChannelStateChange() {
	var readyState = receiveChannel.readyState;
    log('Receive channel state is: ' + readyState);
}



div = document.getElementById('scratchPad');
var socket = io.connect('http://localhost:8181');
channel = prompt("Enter signaling channel name:");
if (channel !== "") {
	console.log('Trying to create or join channel: ', channel);
	socket.emit('create or join', channel);
}

socket.on('created', function (channel){
console.log('channel ' + channel + ' has been created!');
console.log('This peer is the initiator...');
div.insertAdjacentHTML( 'beforeEnd', '<p>Time: ' +
(performance.now() / 1000).toFixed(3) + ' --> Channel '
+ channel + ' has been created! </p>');
div.insertAdjacentHTML( 'beforeEnd', '<p>Time: ' +
(performance.now() / 1000).toFixed(3) +
' --> This peer is the initiator...</p>');
});

socket.on('full', function (channel){
console.log('channel ' + channel + ' is too crowded! \
Cannot allow you to enter, sorry :-(');
div.insertAdjacentHTML( 'beforeEnd', '<p>Time: ' +
(performance.now() / 1000).toFixed(3) + ' --> \
channel ' + channel + ' is too crowded! \
Cannot allow you to enter, sorry :-( </p>');
});

socket.on('remotePeerJoining', function (channel){
	console.log('Request to join ' + channel);
    console.log('You are the initiator!');
    div.insertAdjacentHTML( 'beforeEnd', '<p style="color:red">Time: ' +
(performance.now() / 1000).toFixed(3) +
' --> Message from server: request to join channel ' +
channel + '</p>');
});

socket.on('joined', function (msg){
console.log('Message from server: ' + msg);
div.insertAdjacentHTML( 'beforeEnd', '<p>Time: ' +
(performance.now() / 1000).toFixed(3) +
' --> Message from server: </p>');
div.insertAdjacentHTML( 'beforeEnd', '<p style="color:blue">' +
msg + '</p>');
div.insertAdjacentHTML( 'beforeEnd', '<p>Time: ' +
(performance.now() / 1000).toFixed(3) +
' --> Message from server: </p>');
div.insertAdjacentHTML( 'beforeEnd', '<p style="color:blue">' +
msg + '</p>');
});

socket.on('broadcast: joined', function (msg){
div.insertAdjacentHTML( 'beforeEnd', '<p style="color:red">Time: ' +
(performance.now() / 1000).toFixed(3) +
' --> Broadcast message from server: </p>');
div.insertAdjacentHTML( 'beforeEnd', '<p style="color:red">' +
msg + '</p>');
console.log('Broadcast message from server: ' + msg);
var myMessage = prompt('Insert message to be sent to your peer:', "");
socket.emit('message', {
	channel: channel,
message: myMessage});
});
socket.on('log', function (array){
	console.log.apply(console, array);
});

socket.on('message', function (message){
console.log('Got message from other peer: ' + message);
div.insertAdjacentHTML( 'beforeEnd', '<p>Time: ' +
(performance.now() / 1000).toFixed(3) +
' --> Got message from other peer: </p>');
div.insertAdjacentHTML( 'beforeEnd', '<p style="color:blue">' +
message + '</p>');
var myResponse = prompt('Send response to other peer:', "");
socket.emit('response', {
channel: channel,
message: myResponse});
});

socket.on('response', function (response){
console.log('Got response from other peer: ' + response);
div.insertAdjacentHTML( 'beforeEnd', '<p>Time: ' +
(performance.now() / 1000).toFixed(3) + ' --> Got response from other peer: </p>');
div.insertAdjacentHTML( 'beforeEnd', '<p style="color:blue">' +
response + '</p>');
var chatMessage = prompt('Keep on chatting.Write "Bye" to quit conversation', "");
if(chatMessage == "Bye"){
div.insertAdjacentHTML( 'beforeEnd', '<p>Time: ' 
(performance.now() / 1000).toFixed(3) + ' --> Sending "Bye" to server...</p>');
console.log('Sending "Bye" to server');
socket.emit('Bye', channel);
div.insertAdjacentHTML( 'beforeEnd', '<p>Time: ' +
(performance.now() / 1000).toFixed(3) +' --> Going to disconnect...</p>');
console.log('Going to disconnect...');
socket.disconnect();
}else{
socket.emit('response', {
channel: channel,
message: chatMessage});
}
});

socket.on('Bye', function (){
console.log('Got "Bye" from other peer! Going to disconnect...');
div.insertAdjacentHTML( 'beforeEnd', '<p>Time: ' +
(performance.now() / 1000).toFixed(3) +
' --> Got "Bye" from other peer!</p>');
div.insertAdjacentHTML( 'beforeEnd', '<p>Time: ' +
(performance.now() / 1000).toFixed(3) +
' --> Sending "Ack" to server</p>');
console.log('Sending "Ack" to server');
socket.emit('Ack');
div.insertAdjacentHTML( 'beforeEnd', '<p>Time: ' 
+(performance.now() / 1000).toFixed(3) + ' --> Going to disconnect...</p>');
console.log('Going to disconnect...');
socket.disconnect();
 });
 
