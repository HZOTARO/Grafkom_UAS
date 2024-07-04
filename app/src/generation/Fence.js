import * as THREE from 'three';
import { OBB } from 'three/examples/jsm/Addons.js';
import { GLTFLoader } from 'three/examples/jsm/Addons.js';

export class Fence {
    constructor(scene, world, position, scale, rotation) {
        this.world = world;
        this.scene = scene;
        this.position = position;
        this.scale = scale;
        this.rotation = rotation

        const loader = new GLTFLoader();
        loader.load('../../asset/model/Fence/Fence.glb', (gltf) => {
            this.model = gltf.scene;
            this.model.traverse((object) => {
                if (object.isMesh) object.castShadow = true;
            });
            this.model.scale.set(scale, scale, scale);
            this.model.position.set(position.x, position.y, position.z);
            this.model.rotation.y = this.rotation;
            this.generateBB(this.rotation);
        
            this.scene.add(this.model);
    

        }, undefined, (error) => {
            console.error('An error occurred loading the character model:', error);
            reject(error);
        });


    }

    generateBB(rotate){
        const box = new THREE.Box3().setFromObject(this.model);
        let helper = new THREE.Box3Helper(box, 0xfff000); // Choose a color for the bounding box
        // this.scene.add(helper);

        let obb = new OBB();
        obb = obb.fromBox3(box);

        // this.scene.add( helper );

        this.world.BB.push(obb);
    }
}