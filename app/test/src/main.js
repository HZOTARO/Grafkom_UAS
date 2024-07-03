import * as THREE from 'three';
import { FirstPersonCamera } from './camera_control/FirstPersonCamera';
import { ThirdPersonCamera } from './camera_control/ThirdPersonCamera';

var scene, camera, renderer, firstPerson_control;
var cube, plane;

const clock = new THREE.Clock();

function init(){
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setAnimationLoop( animate );
    document.body.appendChild( renderer.domElement );
    
    const geometry = new THREE.BoxGeometry( 1, 1, 1 );
    const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
    cube = new THREE.Mesh( geometry, material );
    scene.add( cube );
    
    plane = new THREE.Mesh( 
        new THREE.PlaneGeometry( 10, 10 ), 
        new THREE.MeshBasicMaterial( { color: 0x00ffff } ) );
    plane.position.y = -0.5;
    plane.rotateX(-Math.PI/2);
    scene.add( plane );
    
    // firstPerson_control = new FirstPersonCamera( camera, new THREE.Vector3(0,0,5) );
    // firstPerson_control.movementSpeed = 10;
    // firstPerson_control.rotationSpeed = 1;

    firstPerson_control = new ThirdPersonCamera( camera, cube.position );
    firstPerson_control.movementSpeed = 10;
    firstPerson_control.rotationSpeed = 1;
    
    window.addEventListener( 'resize', onWindowResize );
    }
    
    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        
        renderer.setSize( window.innerWidth, window.innerHeight );
        
    // firstPerson_control.handleResize();
}

function animate() {
    firstPerson_control.update( clock.getDelta() );
	cube.rotation.x += 0.01;
	cube.rotation.y += 0.01;

	renderer.render( scene, camera );
}

init();