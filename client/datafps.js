DataFPS = function() {

    var renderer;
    var scene;
    var camera;
    var light;
    var width;
    var height;

    this.init = function(width, height, props) {

        this.width = width;
        this.height = height;
        this.props = props;

        renderer = new THREE.WebGLRenderer(props);

        renderer.setClearColor(0xFFFFFF);

        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(45, this.width/this.height, 0.1, 10000);
        camera.position.set(0, 0, 100);
        light = new THREE.AmbientLight(0x00FF00);

        scene.add(camera);
        scene.add(light);

        var controls = new THREE.OrbitControls(camera);

        // tmp
        var material = new THREE.MeshBasicMaterial( {color: 0xff0000, side:THREE.DoubleSide} );
        var model = new THREE.BoxGeometry(1, 1, 1, 5, 5, 5);
        scene.add(new THREE.Mesh(model, material));

        scene.add(new THREE.Mesh(new THREE.PlaneGeometry(10, 10 ), new THREE.MeshBasicMaterial({color: 0x00ff00, side:THREE.DoubleSide})));

    }


    this.go = function() {
        
        var animate = function() {
            renderer.clear();

            camera.lookAt(scene.position);

            renderer.render(scene, camera);
	    window.requestAnimationFrame(animate, renderer.domElement);            
        }


        animate();
    }

}


window.onload = function() {

    dfps = new DataFPS();
    dfps.init( 500, 500, { antialias: true, canvas: world });

    dfps.go();
};

