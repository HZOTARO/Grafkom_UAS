import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

export class Tree {
    constructor(scene, scale, position) {
        this.scene = scene;
        this.scale = scale;
        this.position = position;
        this.loadModel();
    }

    loadModel() {
        var loader = new FBXLoader();
        loader.setPath("../../asset/model/Pine_Tree/");
        loader.load("Resource_PineTree_Group.fbx", (fbx) => {
            fbx.scale.setScalar(0.01);
            fbx.traverse(c=> {
                c.castShadow = true;
            });
            this.mesh = fbx;
            this.mesh.scale.set(this.scale, this.scale, this.scale);
            this.mesh.position.set(this.position.x, this.position.y, this.position.z); // Menggunakan this.position.z untuk sumbu z
            this.scene.add(this.mesh);
        }, undefined, (error) => {
            console.error('Error loading FBX model:', error);
        });
    }
}

export function generateTrees(scene, gridSize, scale) {
    const trees = [];
    const spacing = 150; // Jarak antar pohon
    const exclusionRadius = 100; // Radius untuk menghindari generate pohon di sekitar (0,0)

    for (let x = -gridSize / 2; x <= gridSize / 2; x += spacing) {
        for (let z = -gridSize / 2; z <= gridSize / 2; z += spacing) { 
            if (Math.sqrt(x * x + z * z) > exclusionRadius) {
                const position = new THREE.Vector3(x, -2, z);
                const tree = new Tree(scene, scale, position);
                trees.push(tree);
            }
        }
    }

    return trees;
}
