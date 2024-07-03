

import * as THREE from 'three';
import Ammo from 'ammo.js';

export class Fire {
    constructor(scene, position, radius, height, particleCount) {
        this.scene = scene;
        this.position = position;
        this.radius = radius;
        this.height = height;
        this.particleCount = particleCount;

        particleFire.install( { THREE: THREE } );
        let geometry = new particleFire.Geometry( this.radius, this.height, this.particleCount );
        let material = new particleFire.Material( { color: 0xff2200 } );
        this.particleFireMesh = new THREE.Points( geometry, material );

        this.particleFireMesh.position.set(position.x, position.y, position.z);

        scene.add( this.particleFireMesh );
    }

    update(delta) {
        this.particleFireMesh.material.update( delta * 0.75 );
    }
}