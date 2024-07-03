// Ground.js
import * as THREE from 'three';

export function createGround(scene) {
    const groundGeo = new THREE.PlaneGeometry(5000, 5000, 1000, 1000);
    const textureLoader = new THREE.TextureLoader();
    textureLoader.setPath("../../asset/terrain/");

    textureLoader.load("grass_texture.png", texture => {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(50, 50);

        textureLoader.load("terrain_texture.png", dispTexture => {
            dispTexture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            dispTexture.repeat.set(1, 1);

            const groundMat = new THREE.MeshStandardMaterial({
                color: 0xffffff,
                map: texture,
                displacementMap: dispTexture,
                displacementScale: 200,
            });

            const groundMesh = new THREE.Mesh(groundGeo, groundMat);
            groundMesh.rotation.x = -Math.PI / 2;
            groundMesh.position.y = -3;
            groundMesh.receiveShadow = true;
            scene.add(groundMesh);

        }, undefined, err => {
            console.error('An error occurred loading the displacement texture:', err);
        });

    }, undefined, err => {
        console.error('An error occurred loading the diffuse texture:', err);
    });
}
