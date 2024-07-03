import * as THREE from 'three';
import { Environment } from './scene/environtment';
import { Player } from './player/Player';

var scene, camera, renderer, player, cameraControl;
var environment;

const clock = new THREE.Clock();

function init(){
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setAnimationLoop( animate );
    document.body.appendChild( renderer.domElement );

        //Ambient Light
        var ambientLight = new THREE.AmbientLight(0x8888FF,100);
        scene.add(ambientLight);

        //Directional Light
        var directionalLight = new THREE.DirectionalLight(0xFFFFFF, 1);
        directionalLight.position.set( 3, 10, 10 );
        directionalLight.castShadow = true;
        directionalLight.shadow.camera.top = 20;
        directionalLight.shadow.camera.bottom = -20;
        directionalLight.shadow.camera.left = - 20;
        directionalLight.shadow.camera.right = 20;
        directionalLight.shadow.camera.near = 0.1;
        directionalLight.shadow.camera.far = 40;
        directionalLight.castShadow = true;
        scene.add(directionalLight);
    
        // scene.add(new THREE.CameraHelper(directionalLight.shadow.camera));
    
        scene.add(directionalLight.target);

    environment = new Environment(scene);
    player = new Player(scene, camera);

    window.addEventListener( 'resize', onWindowResize );
    }
    
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    
    renderer.setSize( window.innerWidth, window.innerHeight );
    
    // firstPerson_control.handleResize();
}

function animate() {
    player.update( clock.getDelta() );

    environment.update();

	renderer.render( scene, camera );
}

init();