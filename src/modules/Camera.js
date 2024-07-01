import * as THREE from 'three';
import { scene } from './Scene.js';

export const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, 10);

scene.add(camera);