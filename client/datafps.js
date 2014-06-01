DataFPS = function() {

    var renderer;
    var scene;
    var camera;
    var light;
    var width;
    var height;
    var wsurl;
    var ws;
    var controls;
    var clock;
    var dirLight;

    this.init = function(width, height, socketURL, props) {

        this.width = width;
        this.height = height;
        this.props = props;
        this.wsurl = socketURL;

        this.ws = new WebSocket("ws://" + socketURL + "/stream");
        
        // graphics setup
        renderer = new THREE.WebGLRenderer(props);
        renderer.shadowMapEnabled=true;
        renderer.shadowMapCullFace = THREE.CullFaceBack;
	renderer.gammaInput = true;
	renderer.gammaOutput = true;


        scene = new THREE.Scene();
	scene.fog = new THREE.Fog( 0xffffff, 1, 5000 );
	scene.fog.color.setHSL( 0.6, 0, 1 );
	renderer.setClearColor( scene.fog.color, 1 );

        camera = new THREE.PerspectiveCamera(45, this.width/this.height, 0.1, 10000);
        //camera.position.set(10, 20, -10);
        camera.position.set(12, 18, 90);
        scene.add(camera);

        // set up controls
        //controls2 = new THREE.OrbitControls(camera);
        controls = new THREE.FirstPersonControls(camera);

        controls.movementSpeed = 25;
        controls.lookSpeed=0.05;
        controls.lookVertical=true;
        controls.lon=-90;

        clock = new THREE.Clock();

        // light1 = new THREE.AmbientLight(0xFFFFFF);
        // light2 = new THREE.PointLight(0xFFFFFF, 1000, 1000);
        // light2.position.set(5,5,0);

        // scene.add(light1);
        // scene.add(light2);

	var hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.6 );
	hemiLight.color.setHSL( 0.6, 1, 0.6 );
	hemiLight.groundColor.setHSL( 0.095, 1, 0.75 );
	hemiLight.position.set( 0, 500, 0 );
        scene.add( hemiLight );

        //dirLight = new THREE.PointLight( 0xffffff, 1, 0 );
        dirLight = new THREE.DirectionalLight( 0xffffff, 1 );
	dirLight.color.setHSL( 0.1, 1, 0.95 );
	dirLight.position.set( 10, 100, -10);
	// dirLight.position.multiplyScalar( 50 );
	scene.add( dirLight );

	dirLight.castShadow = true;
        
	dirLight.shadowMapWidth = 2048;
	dirLight.shadowMapHeight = 2048;
        var d = 50;

	dirLight.shadowCameraLeft = -d;
	dirLight.shadowCameraRight = d;
	dirLight.shadowCameraTop = d;
	dirLight.shadowCameraBottom = -d;

	dirLight.shadowCameraFar = 3500;
	dirLight.shadowBias = -0.0001;
	dirLight.shadowDarkness = 0.35;
	// dirLight.shadowCameraVisible = true;


        // GROUND
        var groundmap = new THREE.ImageUtils.loadTexture('data/cha_streets.png');
        


	// var groundGeo = new THREE.PlaneGeometry( 10000, 10000 );
        var groundGeo = new THREE.PlaneGeometry( 6769, 4809 );

        // var groundGeo = new THREE.Geometry();
        // groundGeo.vertices = [];
        // groundGeo.vertices.push(new THREE.Vector3(0,0,0));
        // groundGeo.vertices.push(new THREE.Vector3(6769,0,0));
        // groundGeo.vertices.push(new THREE.Vector3(6769,0,4809));
        // groundGeo.vertices.push(new THREE.Vector3(0,0,4809));
        // groundGeo.faces=[];
        // groundGeo.faces.push(new THREE.Face4(0,1,2,3));

	var groundMat = new THREE.MeshPhongMaterial( { ambient: 0xffffff, color: 0xffffff, specular: 0x152535, map: groundmap } );
	groundMat.color.setHSL( 0.095, 1, 0.75 );

	var ground = new THREE.Mesh( groundGeo, groundMat );
	ground.rotation.x = -Math.PI/2;
	ground.position.y = 0;
        ground.position.x = 3384.5;
        ground.position.z = 2404.5;
	scene.add( ground );
	ground.receiveShadow = true;


	// SKYDOME

	var vertexShader = document.getElementById( 'vertexShader' ).textContent;
	var fragmentShader = document.getElementById( 'fragmentShader' ).textContent;
	var uniforms = {
	    topColor: 	 { type: "c", value: new THREE.Color( 0x0077ff ) },
	    bottomColor: { type: "c", value: new THREE.Color( 0xffffff ) },
	    offset:		 { type: "f", value: 33 },
	    exponent:	 { type: "f", value: 0.6 }
	}
	uniforms.topColor.value.copy( hemiLight.color );

	scene.fog.color.copy( uniforms.bottomColor.value );

	var skyGeo = new THREE.SphereGeometry( 4000, 32, 15 );
	var skyMat = new THREE.ShaderMaterial( { vertexShader: vertexShader, fragmentShader: fragmentShader, uniforms: uniforms, side: THREE.BackSide } );

	var sky = new THREE.Mesh( skyGeo, skyMat );
	scene.add( sky );


        this.ws.onmessage = function(message) {
            
            // console.log("got a message");
            // console.log("msg: " + message);

            // console.log(message);
            var foo = jQuery.parseJSON(message.data);
            // console.log(foo);
            // console.log("goodbye");

            var model = new THREE.Geometry();
            // model.vertices = foo.vertices;
            model.vertices = [];
            model.faces = [];

            for (var v=0; v<foo.vertices.length; v++) {
                var a = new THREE.Vector3(foo.vertices[v][0],
                                          foo.vertices[v][1],
                                          foo.vertices[v][2]);
                // console.log(a);
                model.vertices.push(a);
            }

            for (var v=0; v<foo.connectivity.length; v++) {
                // console.log("blah");
                // console.log("hi "  + foo.connectivity[v]);
                // console.log(foo.connectivity[v]);

                var b = new THREE.Face3(foo.connectivity[v][0],
                                        foo.connectivity[v][1],
                                        foo.connectivity[v][2]);

                model.faces.push(b);
            }
            
            
            // model.faces = foo.connectivity;
            

            // tmp
	    // var material = new THREE.MeshPhongMaterial( { color: 0xffffff, specular: 0xffffff, shininess: 20, vertexColors: THREE.FaceColors, shading: THREE.FlatShading } );

            //var material = new THREE.MeshPhongMaterial( { ambient: 0xffffff, color: 0xffffff, specular: 0x050505 } );
	// groundMat.color.setHSL( 0.095, 1, 0.75 );


            var material = new THREE.MeshBasicMaterial( {color: 0xff0000, side:THREE.DoubleSide, shininess: 20, vertexColors: THREE.FaceColors, shading: THREE.FlatShading } );
            // var texture = THREE.ImageUtils.loadTexture( "textures/disturb.jpg" );
// 	    texture.repeat.set( 2, 2 );
// 	    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
// 	    texture.format = THREE.RGBFormat;
// 
            // var material = new THREE.MeshPhongMaterial( { color: 0xff0000, ambient: 0x444444 } );

            // var model = new THREE.BoxGeometry(1, 1, 1, 5, 5, 5);

            // var mesh = THREE.SceneUtils.createMultiMaterialObject( model, [
            //     new THREE.MeshNormalMaterial( { color: 0xffffff} ),
            //     new THREE.MeshBasicMaterial( { color: 0x222222, wireframe: true})
            // ]);
            var mesh = new THREE.Mesh(model, material);
            mesh.castShadow=true;
            mesh.receiveShadow=true;
            model.computeMorphNormals();

            scene.add(mesh);
        }


        



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

            // camera.lookAt(scene.position);
            // camera.lookAt(new THREE.Vector3(0,0,0));
            // dirLight.position.set(camera.position);
            
//            console.log(camera.position.x + " " + camera.position.y + " " + camera.position.z);

            controls.update( clock.getDelta() );
            renderer.render(scene, camera);

            // console.log(renderer.domElement);
            window.requestAnimationFrame(animate, renderer.domElement);            
        }


        animate();
    }

}


window.onload = function() {

    dfps = new DataFPS();
//    dfps.init( 1000, 750, "epsilon.2014.hackanooga.com:8080", { antialias: true, canvas: world });
    dfps.init( 800, 600, "localhost:8080", { antialias: true, canvas: world });

    dfps.go();
};

