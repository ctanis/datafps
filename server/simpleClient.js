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

    function MeshRequest(id)
    {
        this.clientID = id;
        this.format = 'mesh'
        this.location = [5,10,5];
    }

    function IDRequest()
    {
        this.format = 'id'
        this.location = [5,10,5];
    }

    function DeltaRequest(id)
    {
        this.clientID = id;
        this.format = 'delta';
        this.location = [5,10,5];
    }

    function Client(id, name, location)
    {
        this.id = id;
        this.name = name;
        this.location = location;
        this.receivedInitial = false;
    }

    Client.prototype.toString = function clientToString() 
    {
        var ret = "Client with ID: "+this.id+" and name "+this.name+" is at x="+this.location.x+", y="+this.location.y+", z="+this.location.z;
        return ret;
    }

    var clientID =0;
    var name = "YoMomma";
    var myLocation = new Vertex(5,10,5);
    var thisClient = new Client('', name, myLocation);

    var vertices = [];
    var connectivities = [];

client.on('connect', function(connection) 
{

    //Register this client with the server.
    connection.sendUTF(JSON.stringify(new IDRequest()));

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
            message = JSON.parse(message.utf8Data);

            if(message.format === 'id')
            {
                //Set this client's newly found identity
                thisClient.id = message.clientID;
                //Ask for a mesh, now that we know how we are.
                var req = MeshRequest(thisClient.id);
                connection.sendUTF(JSON.stringify(req));
            }
            else if(message.format === 'delta')
            {
                var req = new DeltaRequest();
            }
            else if(message.format === 'mesh')
            {
                console.log('Got a mesh...');
                vertices.push(message.vertices);
                connectivities.push(message.connectivities)
                //Now that we have the full mesh, just ask for deltas
                var req = new DeltaRequest(thisClient.id);
                connection.sendUTF(JSON.stringify(req));

            }

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