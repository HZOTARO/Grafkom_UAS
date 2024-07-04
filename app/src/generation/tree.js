import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { OBB } from 'three/examples/jsm/Addons.js';

export class Tree {
    constructor(scene, world, scale, position) {
        this.scene = scene;
        this.world = world;
        this.scale = scale;
        this.position = position;
        this.loadModel();
    }

    loadModel() {
        var loader = new FBXLoader();
        loader.setPath("../../asset/model/Pine_Tree/");
        loader.load("Resource_PineTree.fbx", (fbx) => {
            fbx.scale.setScalar(0.01);
            fbx.traverse(c=> {
                if(c.isMesh) {
                    c.castShadow = true;
                    c.receiveShadow = true;
                }
            });
            this.mesh = fbx;
            this.mesh.scale.set(this.scale, this.scale, this.scale);
            this.mesh.position.set(this.position.x, this.position.y, this.position.z); // Menggunakan this.position.z untuk sumbu z
            this.scene.add(this.mesh);
            this.generateBB();
        }, undefined, (error) => {
            console.error('Error loading FBX model:', error);
        });
    }

    generateBB(){
        const box = new THREE.Box3().setFromObject(this.mesh);
        let helper = new THREE.Box3Helper(box, 0xfff000); // Choose a color for the bounding box
        // this.scene.add(helper);

        let obb = new OBB();
        obb = obb.fromBox3(box);

        this.world.BB.push(obb);
    }
}



export function generateTrees(scene, world, gridSize, scale) {
    const trees = [];
    // const spacing = 200; // Jarak antar pohon
    // const exclusionRadius = 250; // Radius untuk menghindari generate pohon di sekitar (0,0)
    // const centralMargin = 0; // Margin untuk menghindari garis tengah
    // const randomShift = 10; // Pergeseran acak untuk variasi

    const spacing = 75; // Jarak antar pohon
    const exclusionRadius = 200; // Radius untuk menghindari generate pohon di sekitar (0,0)
    const centralMargin = 0; // Margin untuk menghindari garis tengah
    const randomShift = 125; // Pergeseran acak untuk variasi

    const randomRange = (min, max) => THREE.MathUtils.randFloat(min, max);

    for (let x = -gridSize / 2; x <= gridSize / 2; x += spacing) {
        for (let z = -gridSize / 2; z <= gridSize / 2; z += spacing) {
            // Menghasilkan posisi acak dalam jangkauan grid dengan variasi
            let randomX = randomRange(x - spacing / 2 + randomShift, x + spacing / 2 - randomShift);
            let randomZ = randomRange(z - spacing / 2 + randomShift, z + spacing / 2 - randomShift);

            // Mengecek jarak dari pusat (0,0) untuk menghindari radius pengecualian dan garis tengah
            const distanceFromCenter = Math.sqrt(randomX * randomX + randomZ * randomZ);

            // Memastikan tidak ada garis lurus di satu sumbu
            if (Math.abs(randomX) < centralMargin) {
                randomX = randomX < 0 ? randomX - centralMargin : randomX + centralMargin;
            }
            if (Math.abs(randomZ) < centralMargin) {
                randomZ = randomZ < 0 ? randomZ - centralMargin : randomZ + centralMargin;
            }

            if ((distanceFromCenter > exclusionRadius) &&
                (Math.abs(randomX) > centralMargin) &&
                (Math.abs(randomZ) > centralMargin)) {
                const position = new THREE.Vector3(randomX, -2, randomZ);
                const tree = new Tree(scene, world, scale * randomRange(0.75, 1.5), position);
                trees.push(tree);
            }
        }
    }

    return trees;
}


