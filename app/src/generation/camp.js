import * as THREE from 'three';
import {GLTFLoader} from "three/addons";
import { Light } from '../utils/lighting.js';
import { OBB } from 'three/examples/jsm/Addons.js';


export class Camp {
    constructor(scene, world, scale = 20, position  = {x: 0, y: 5.5, z: 0}) {
        this.scene = scene;
        this.world = world;
        this.position = position;
        this.scale = scale;

        const loader = new GLTFLoader();
        loader.load('../../asset/model/Camp/Camp.glb', (gltf) => {
            this.model = gltf.scene;
            this.model.traverse((object) => {
                if (object.isMesh) object.castShadow = true;
            });
            this.model.scale.set(this.scale, this.scale, this.scale);
            this.model.position.set(this.position.x, this.position.y, this.position.z);

            this.scene.add(this.model);

            this.generateBB();

            this.campFireLight();

        }, undefined, (error) => {
            console.error('An error occurred loading the character model:', error);
            reject(error);
        });
    }

    generateBB(){
        const box = new THREE.Box3().setFromObject(this.model);
        let helper = new THREE.Box3Helper(box, 0xfff000); // Choose a color for the bounding box
        // this.scene.add(helper);

        let obb = new OBB();
        obb = obb.fromBox3(box);

        this.world.BB.push(obb);
    }

    campFireLight() {
        const geometry = new THREE.SphereGeometry(0.1, 1, 1);
        const material = new THREE.MeshPhongMaterial({ color: 0xffff33 });
        const mesh = new THREE.Mesh(geometry, material);
        this.scene.add(mesh);
        mesh.visible = true;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
    
        this.light = new Light(this.scene);
        this.light.createPointLight(0.8, 0, 0.2); // (intensity, decay, distance)
        mesh.add(this.light.pointLight);
        mesh.position.set(this.position.x-23, this.position.y-5, this.position.z+18);
    }    
}