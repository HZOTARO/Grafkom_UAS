import * as THREE from 'three';

export class Environment{
    constructor(scene){
        this.scene = scene;

        const geometry = new THREE.BoxGeometry( 1, 1, 1 );
        const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
        this.cube = new THREE.Mesh( geometry, material );
        this.scene.add( this.cube );
        
        this.plane = new THREE.Mesh( 
            new THREE.PlaneGeometry( 10, 10 ), 
            new THREE.MeshBasicMaterial( { color: 0x00ffff } ) );
        this.plane.position.y = -0.5;
        this.plane.rotateX(-Math.PI/2);
        this.scene.add( this.plane );
    }

    update(){
        this.cube.rotation.x += 0.01;
        this.cube.rotation.y += 0.01;
    }
}
