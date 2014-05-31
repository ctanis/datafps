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

    var myLocation = new Vertex(5,10,5);



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


    function sendPostion()
    {
        if(connection.connected)
        {
            //Example: Update Postion
            myLocation.y=myLocation.y+5;
            myLocation.x=myLocation.x+2;
            myLocation.z=myLocation.z+3;
            connection.sendUTF(JSON.stringify(myLocation));
            setTimeout(sendPostion, 1000);
        }
    }
    sendPostion();
});

client.connect('ws://localhost:8080/', 'echo-protocol');