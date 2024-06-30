import * as THREE from 'three';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

export class Camp {
    constructor(scene, scale) {
        this.scene = scene;
        this.scale = scale;
        this.loadModel();
    }

    loadModel() {
        const mtlLoader = new MTLLoader();
        mtlLoader.setPath('./models/Cabin/');
        mtlLoader.load('Cabin 2.mtl', (materials) => {
            materials.preload();

            const objLoader = new OBJLoader();
            objLoader.setMaterials(materials);
            objLoader.setPath('./models/Cabin/');
            objLoader.load('Cabin 2.obj', (object) => {
                object.traverse((child) => {
                    if (child instanceof THREE.Mesh) {
                        console.log('Mesh found:', child);
                        const textureLoader = new THREE.TextureLoader();
                        const texturePath = './models/Cabin/Cabin Texture.png'; // Sesuaikan path dengan ekstensi yang benar
                        child.material.map = textureLoader.load(texturePath, (texture) => {
                            console.log('Texture loaded:', texture);
                        }, undefined, (error) => {
                            console.error('Error loading texture:', error);
                        });
                    }
                });

                object.scale.set(this.scale, this.scale, this.scale);
                object.position.set(0, 0, 0);

                this.mesh = object;
                this.scene.add(this.mesh);
            }, undefined, (error) => {
                console.error('An error occurred loading the OBJ:', error);
            });
        }, undefined, (error) => {
            console.error('An error occurred loading the MTL:', error);
        });
    }
}
