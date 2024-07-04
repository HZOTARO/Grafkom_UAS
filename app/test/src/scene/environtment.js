import * as THREE from 'three';

export class Environment{
    constructor(scene, world){
        this.scene = scene;

        const geometry = new THREE.BoxGeometry( 1, 1, 1 );
        const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
        this.cube = new THREE.Mesh( geometry, material );
        this.cube.position.z = -3;
        this.scene.add( this.cube );
        
        this.plane = new THREE.Mesh( 
            new THREE.PlaneGeometry( 10, 10 ), 
            new THREE.MeshBasicMaterial( { color: 0x00ffff } ) );
        this.plane.position.y = -0.5;
        this.plane.rotateX(-Math.PI/2);
        this.scene.add( this.plane );

        const box = new THREE.Box3();
        box.setFromObject(this.cube);
        box.position = this.cube.position;
        // box.setFromCenterAndSize( new THREE.Vector3( 1, 1, 1 ), new THREE.Vector3( 2, 1, 3 ) );

        const helper = new THREE.Box3Helper( box, 0xffff00 );
        scene.add( helper );

        world.BB.push(box);
    }

    update(){
        this.cube.rotation.x += 0.01;
        this.cube.rotation.y += 0.01;
    }
}
