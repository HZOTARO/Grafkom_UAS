import * as THREE from 'three';

export class Smoke {
    constructor(scene, size, position, opacity) {
        this.scene = scene;

        const geometry = new THREE.SphereGeometry(size.x, 60, 60);

        const material = new THREE.MeshPhongMaterial({
            color: 0xbccbcc,
            transparent: true,
            opacity: opacity
        });

        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(position.x, position.y, position.z);

        scene.add(this.mesh);
    }
}
