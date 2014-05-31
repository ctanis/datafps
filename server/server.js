#!/usr/bin/env node
var WebSocketServer = require('websocket').server;
var http = require('http');
var fs = require('fs');
var file = __dirname + '/test.json';

var server = http.createServer(function(request, response) {
    console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
});
server.listen(8080, function() {
    console.log((new Date()) + ' Server is listening on port 8080');
});

wsServer = new WebSocketServer({
    httpServer: server,
    // You should not use autoAcceptConnections for production
    // applications, as it defeats all standard cross-origin protection
    // facilities built into the protocol and the browser.  You should
    // *always* verify the connection's origin and decide whether or not
    // to accept it.
    autoAcceptConnections: false
});

function originIsAllowed(origin) {
  // put logic here to detect whether the specified origin is allowed.
  return true;
}

//--------------------------------
//  Load Data
//--------------------------------
var file = __dirname + '/test.json';
var initialData;
function loadData()
{
    fs.readFile(file, 'utf8', function (err, data) 
    {
        if (err) 
        {
            console.log('Error: ' + err);
            return;
        }     
        initialData = JSON.parse(data);
    });
}

function Vertex(x,y,z) 
{
    this.x = x;
    this.y = y;
    this.z = z;
}
function Triangle(v1,v2,v3)
{
    this.v1 =v1;
    this.v2 = v2;
    this.v3 = v3;
}

v0 = new Vertex(0,0,0);
v1 = new Vertex(0,1,0);
v2 = new Vertex(1,1,0);
v3= new Vertex(1,0,0);

vertices = [];
vertices.push(v0);
vertices.push(v1);
vertices.push(v2);
vertices.push(v3);

connectivity = [];
t1 = [0,2,1];
t2 = [0,3,2];
connectivity.push(t1);
connectivity.push(t2);

function Packet(format, vertices, connectivity)
{
    this.format = format;
    this.vertices=vertices;
    this.connectivity = connectivity;
}

//t1 = new Triangle(v1, v3, v2);
//t2 = new Triangle(v1, v4, v3);



wsServer.on('request', function(request) {
    if (!originIsAllowed(request.origin)) {
      // Make sure we only accept requests from an allowed origin
      request.reject();
      console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
      return;
    }

    var connection = request.accept('echo-protocol', request.origin);
    console.log((new Date()) + ' Connection accepted.');
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            var object = JSON.parse(message.utf8Data);
            console.log('Received Message');
            console.log('   Name: '+object.name);
            console.log('   ID: '+object.id);
            console.log('   Location: '+object.location.x+","+object.location.y+","+object.location.z);
            connection.sendUTF(message.utf8Data);
            packet = new Packet('mesh',vertices,connectivity);
            connection.sendUTF(JSON.stringify(packet));
        }

        else if (message.type === 'binary') {
            console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
            connection.sendBytes(message.binaryData);
        }
    });
    connection.on('close', function(reasonCode, description) {
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    });
});
loadData();
