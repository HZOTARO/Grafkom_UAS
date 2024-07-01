import * as THREE from 'three';
import { scene } from './scene.js';

export let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
camera.position.set(0, 1000, 100);

scene.add(camera);
