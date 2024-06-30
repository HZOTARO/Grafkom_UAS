import * as THREE from 'three';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

export class Camp {
    constructor(scene, scale, pos) {
        this.scene = scene;
        this.scale = scale;
        this.pos = pos;
        this.loadModel();
    }

    loadModel() {
        const mtlLoader = new MTLLoader();
        mtlLoader.setPath('./models/Camp/'); // Sesuaikan path dengan tempat Anda menyimpan file MTL
        mtlLoader.load('materials.mtl', (materials) => {
            materials.preload();

            const objLoader = new OBJLoader();
            objLoader.setMaterials(materials);
            objLoader.setPath('./models/Camp/'); // Sesuaikan path dengan tempat Anda menyimpan file OBJ
            objLoader.load('model.obj', (object) => {
                // object.traverse(function(child) {
                //     if (child instanceof THREE.Mesh) {
                //         // Menyesuaikan properti material seperti tekstur basecolor
                //         const textureLoader = new THREE.TextureLoader();
                //         child.material.map = textureLoader.load('./models/Pine_Tree/PineTree_BaseColor.jpg');
                //     }
                // });

                // Sesuaikan skala objek
                object.scale.set(this.scale, this.scale, this.scale);
                object.position.set(this.pos.x, this.pos.y, this.pos.z); // Menyesuaikan posisi objek

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
