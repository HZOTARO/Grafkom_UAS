

import * as THREE from 'three';
import { OBB } from 'three/examples/jsm/Addons.js';
import Ammo from 'ammo.js';
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
        
            // const gltfAnimations = gltf.animations;
            // const mixer = new THREE.AnimationMixer(this.model);
            // const animationsMap = new Map();
            // gltfAnimations.filter(a => a.name !== 'A-Pose').forEach((a) => {
            //     animationsMap.set(a.name, mixer.clipAction(a));
            // });
        
            // if (!this.orbitControls) {
            //     console.error('OrbitControls is undefined');
            //     reject('OrbitControls is undefined');
            //     return;
            // }
            
            // this.characterControls = new CharacterControls(this.model, mixer, animationsMap, this.orbitControls, this.camera, 'Poses');
        }, undefined, (error) => {
            console.error('An error occurred loading the character model:', error);
            reject(error);
        });


    }

    generateBB(rotate){
        // this.model.userData.obb = new OBB();
        // this.model.userData.obb.halfSize.copy( this.model.scale ).multiplyScalar( 0.5 );

        const box = new THREE.Box3().setFromObject(this.model);
        let helper = new THREE.Box3Helper(box, 0xfff000); // Choose a color for the bounding box
        // this.scene.add(helper);

        let obb = new OBB();
        obb = obb.fromBox3(box);

        // const box = new THREE.Box3();
        // box.setFromObject(this.model, true);
        // box.position = this.model.position;

        // box.rotation.y = rotate;

        // const helper = new THREE.Box3Helper( box, 0xffff00 );
        // this.scene.add( helper );

        this.world.BB.push(obb);
    }

    update(delta) {
        // Add any updates to the platform here if needed
    }
}