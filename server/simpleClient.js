#!/usr/bin/env node
var WebSocketClient = require('websocket').client;

var client = new WebSocketClient();

client.on('connectFailed', function(error) {
    console.log('Connect Error: ' + error.toString());
});


    function Vertex(x,y,z) 
    {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    function Client(id, name, location)
    {
        this.id = id;
        this.name = name;
        this.location = location;
    }
    
    Client.prototype.toString = function clientToString() 
    {
        var ret = "Client with ID: "+this.id+" and name "+this.name+" is at x="+this.location.x+", y="+this.location.y+", z="+this.location.z;
        return ret;
    }

    var clientID =0;
    var name = "YoMomma";
    var myLocation = new Vertex(5,10,5);
    var tempClient = new Client(clientID, name, myLocation);


client.on('connect', function(connection) 
{


    console.log('WebSocket client connected');

    connection.on('error', function(error) 
    {
        console.log("Connection Error: " + error.toString());
    });

    connection.on('close', function() 
    {
        console.log('echo-protocol Connection Closed');
    });

    connection.on('message', function(message) 
    {
        if (message.type === 'utf8') 
        {
            console.log("Received: '" + message.utf8Data + "'");
        }
    });


    function sendClient()
    {
        if(connection.connected)
        {
            //Example: Update Postion
            tempClient.location.y=myLocation.y+5;
            tempClient.location.x=myLocation.x+2;
            tempClient.location.z=myLocation.z+3;
            connection.sendUTF(JSON.stringify(tempClient));
            setTimeout(sendClient, 1000);
        }
    }
    sendClient();
});

client.connect('http://epsilon.2014.hackanooga.com:8080', 'echo-protocol');