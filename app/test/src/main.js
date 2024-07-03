import * as THREE from 'three';
import { FirstPersonCamera } from './camera_control/FirstPersonCamera';
import { ThirdPersonCamera } from './camera_control/ThirdPersonCamera';
import { Environment } from './scene/environtment';

var scene, camera, renderer, cameraControl;
var environment;

const clock = new THREE.Clock();

function init(){
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setAnimationLoop( animate );
    document.body.appendChild( renderer.domElement );

    environment = new Environment(scene);
    
    // firstPerson_control = new FirstPersonCamera( camera, new THREE.Vector3(0,0,5) );
    // firstPerson_control.movementSpeed = 10;
    // firstPerson_control.rotationSpeed = 1;

    cameraControl = new ThirdPersonCamera( camera, environment.cube.position );
    cameraControl.movementSpeed = 10;
    cameraControl.rotationSpeed = 1;
    
    document.addEventListener("keypress", (e) => onKeyPressed(e), false);
    window.addEventListener( 'resize', onWindowResize );
    }
    
function onKeyPressed(e){
    switch (e.key.toUpperCase()) {
        case 'T':
            cameraControl = new ThirdPersonCamera( camera, environment.cube.position );
            cameraControl.movementSpeed = 10;
            cameraControl.rotationSpeed = 1;
            break;
        
        case 'F':
            cameraControl = new FirstPersonCamera( camera, new THREE.Vector3(0,0,5) );
            cameraControl.movementSpeed = 10;
            cameraControl.rotationSpeed = 1;
            break;
    
        default:
            break;
    }
}
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    
    renderer.setSize( window.innerWidth, window.innerHeight );
    
    // firstPerson_control.handleResize();
}

function animate() {
    cameraControl.update( clock.getDelta() );

    environment.update();

	renderer.render( scene, camera );
}

init();