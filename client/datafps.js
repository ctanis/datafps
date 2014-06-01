DataFPS = function() {

    var renderer;
    var scene;
    var camera;
    var light;
    var width;
    var height;
    var wsurl;
    var ws;

    this.init = function(width, height, socketURL, props) {

        this.width = width;
        this.height = height;
        this.props = props;
        this.wsurl = socketURL;

        // this.ws = $.websocket("ws://" + socketURL,
        //                       {
        //                           events:
        //                           {
        //                               mesh: function(e)
        //                               {
        //                                   alert(e);
        //                               }
        //                           }
        //                       }
        //                      );

        this.ws = new WebSocket("ws://" + socketURL + "/stream");

        this.ws.onmessage = function(message) {
            
            console.log("got a message");
            // console.log("msg: " + message);

            // console.log(message);
            var foo = jQuery.parseJSON(message.data);
            console.log(foo);
            // console.log("goodbye");

            var model = new THREE.Geometry();
            // model.vertices = foo.vertices;
            model.vertices = [];
            model.faces = [];

            for (var v=0; v<foo.vertices.length; v++) {
                var a = new THREE.Vector3(foo.vertices[v][0],
                                          foo.vertices[v][1],
                                          foo.vertices[v][2]);
                console.log(a);
                model.vertices.push(a);
            }

            for (var v=0; v<foo.connectivity.length; v++) {
                console.log("blah");
                console.log("hi "  + foo.connectivity[v]);
                console.log(foo.connectivity[v]);

                var b = new THREE.Face3(foo.connectivity[v][0],
                                        foo.connectivity[v][1],
                                        foo.connectivity[v][2]);

                model.faces.push(b);
            }
            
            
            // model.faces = foo.connectivity;
            

            // tmp
            var material = new THREE.MeshBasicMaterial( {color: 0xff0000, side:THREE.DoubleSide, wireframe: true } );
            // var model = new THREE.BoxGeometry(1, 1, 1, 5, 5, 5);
            
            var mesh = THREE.SceneUtils.createMultiMaterialObject( model, [
                new THREE.MeshNormalMaterial( { color: 0xffffff} ),
                new THREE.MeshBasicMaterial( { color: 0x222222, wireframe: true})
            ]);

            scene.add(mesh);
        }


        renderer = new THREE.WebGLRenderer(props);

        renderer.setClearColor(0xFFFFFF);

        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(45, this.width/this.height, 0.1, 10000);
        camera.position.set(0, 0, 100);
        light = new THREE.AmbientLight(0x000000);

        scene.add(camera);
        scene.add(light);

        var controls = new THREE.OrbitControls(camera);

        //         // tmp
        //         var material = new THREE.MeshBasicMaterial( {color: 0xff0000, side:THREE.DoubleSide, wireframe: true } );
        //         var model = new THREE.BoxGeometry(1, 1, 1, 5, 5, 5);

        //         var mesh = THREE.SceneUtils.createMultiMaterialObject( model, [
        //             new THREE.MeshNormalMaterial( { color: 0xffffff} ),
        //             new THREE.MeshBasicMaterial( { color: 0x222222, wireframe: true} )

        // ]);

        //        scene.add(new THREE.Mesh(model, material));
        // scene.add(mesh);
        // var plane = new THREE.PlaneGeometry(10, 10 );
        // var v = new THREE.Vector3(0, -1, 0);
        // plane.translate(v);

        // scene.add(new THREE.Mesh(plane , new THREE.MeshBasicMaterial({color: 0x00ff00, side:THREE.DoubleSide})));

    }


    this.go = function() {
        
        var animate = function() {
            renderer.clear();

            camera.lookAt(scene.position);

            renderer.render(scene, camera);

            // console.log(renderer.domElement);
            window.requestAnimationFrame(animate, renderer.domElement);            
        }


        animate();
    }

}


window.onload = function() {

    dfps = new DataFPS();
    dfps.init( 1000, 750, "epsilon.2014.hackanooga.com:8080", { antialias: true, canvas: world });

    dfps.go();
};

