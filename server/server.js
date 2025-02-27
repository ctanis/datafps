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

function Client(id, name, location)
{
    this.id = id;
    this.name = name;
    this.location = location;
    this.receivedInitial = false;
}

v0 = new Vertex(0,0,0);
v1 = new Vertex(0,2,0);
v2 = new Vertex(1,1,0);
v3= new Vertex(1,0,0);

vertices = [];
///vertices.push([0,0,0]);
//vertices.push([0,1,0]);
//vertices.push([1,1,0]);
//vertices.push([1,0,0]);

vertices.push([0,0,0]);
vertices.push([10,0,0]);
vertices.push([10,0,10]);
vertices.push([0,0,10]);
vertices.push([0,10,0]);
vertices.push([10,10,0]);
vertices.push([10,10,10]);
vertices.push([0,10,10]);

connectivity = [];
//t1 = [0,2,1];
//t2 = [0,3,2];
t1 = [0,1,5];
t2 = [0,5,4];
t3 = [4,5,6];
t4 = [4,6,7];
t5 = [7,6,2];
t6 = [7,2,3];
t7 = [0,3,2];
t8 = [0,2,1];
t9 = [4,7,3];
t10 = [4,3,0];
t11 = [5,2,6];
t12 = [5,1,2];
connectivity.push(t1);
connectivity.push(t2);
connectivity.push(t3);
connectivity.push(t4);
connectivity.push(t5);
connectivity.push(t6);
connectivity.push(t7);
connectivity.push(t8);
connectivity.push(t9);
connectivity.push(t10);
connectivity.push(t11);
connectivity.push(t12);

var clientCounter = 0;


packet = new Packet('mesh',vertices,connectivity);
function Packet(format, clientID, vertices, connectivity)
{
    this.format = format;
    this.clientID = clientID;
    this.vertices=vertices;
    this.connectivity = connectivity;
}

//t1 = new Triangle(v1, v3, v2);
//t2 = new Triangle(v1, v4, v3);

clients = [];

wsServer.on('request', function(request) {
    if (!originIsAllowed(request.origin)) {
      // Make sure we only accept requests from an allowed origin
      request.reject();
      console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
      return;
    }

    var connection = request.accept(null, request.origin);
    //connection.sendUTF(JSON.stringify(packet));
    console.log('sending:'+packet);
    console.log((new Date()) + ' Connection accepted.');

    connection.on('message', function(message) {
        if (message.type === 'utf8') {

            //Parse json, figure out what kind of request it is.
            message = JSON.parse(message.utf8Data);
            //Message should have a format
            if(message.format === 'id')
            {
                clients.push(new Client(clientCounter, 'testClient', message.location));
                var packet = new Packet('id',clientCounter,[],[]);
                //Increment client counter... unique-ish
                clientCounter++;
                //Send response back with new ID packet
                connection.sendUTF(JSON.stringify(packet));
            }
            else if(message.format === 'delta')
            {
                var packet = new Packet('delta');
                //Update connection.
                clients[message.clientID].location=message.location;

                connection.sendUTF(JSON.stringify(packet));
            }
            else if(message.format === 'mesh')
            {
                var packet = new Packet('mesh',vertices,connectivity);
                connection.sendUTF(JSON.stringify(packet));
            }

            //var object = JSON.parse(message.utf8Data);
            //connection.sendUTF(object.utf8Data);

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

