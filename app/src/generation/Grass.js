import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/Addons.js';

export class Grass {
    constructor(scene, position, scale, rotation) {
        this.scene = scene;
        this.position = position;
        this.scale = scale;
        this.rotation = rotation

        const loader = new GLTFLoader();
        loader.load('../../asset/model/Grass/Grass.glb', (gltf) => {
            this.model = gltf.scene;
            this.model.traverse((object) => {
                if (object.isMesh) object.castShadow = true;
            });
            this.model.scale.set(scale, scale, scale);
            this.model.position.set(position.x, position.y, position.z);
            this.model.rotation.y = this.rotation;
        
            this.scene.add(this.model);

        }, undefined, (error) => {
            console.error('An error occurred loading the character model:', error);
            reject(error);
        });
    }
}

export function generateGrass(scene, gridSize, scale) {
    const grasses = [];
    const spacing = 50; // Distance between grass instances
    const exclusionRadius = 100; // Radius to avoid generating grass near the center (0,0)
    const centralMargin = 20; // Margin to avoid the central line
    const randomShift = 10; // Random shift for variation

    const randomRange = (min, max) => THREE.MathUtils.randFloat(min, max);

    for (let x = -gridSize / 2; x <= gridSize / 2; x += spacing) {
        for (let z = -gridSize / 2; z <= gridSize / 2; z += spacing) {
            // Generate random position within the grid with some variation
            let randomX = randomRange(x - spacing / 2 + randomShift, x + spacing / 2 - randomShift);
            let randomZ = randomRange(z - spacing / 2 + randomShift, z + spacing / 2 - randomShift);

            // Check distance from the center to avoid the exclusion radius and central line
            const distanceFromCenter = Math.sqrt(randomX * randomX + randomZ * randomZ);

            // Ensure there are no straight lines along one axis
            if (Math.abs(randomX) < centralMargin) {
                randomX = randomX < 0 ? randomX - centralMargin : randomX + centralMargin;
            }
            if (Math.abs(randomZ) < centralMargin) {
                randomZ = randomZ < 0 ? randomZ - centralMargin : randomZ + centralMargin;
            }


            if (distanceFromCenter > exclusionRadius &&
                Math.abs(randomX) > centralMargin &&
                Math.abs(randomZ) > centralMargin) {
                const position = new THREE.Vector3(randomX, -3, randomZ);
                const grass = new Grass(scene, position, scale, 0);
                console.log(position.y);
                grasses.push(grass);
            }
        }
    }
    return grasses;
}