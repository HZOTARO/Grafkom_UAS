import * as THREE from 'three';

export const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);
scene.fog = new THREE.Fog(0x87ceeb, 100, 1000);

const cubeTextureLoader = new THREE.CubeTextureLoader();
cubeTextureLoader.setPath('../../asset/skybox/'); // Path to your skybox textures

export const skyboxTexture = cubeTextureLoader.load([
    'px.png', 'nx.png', // Right, Left
    'py.png', 'ny.png', // Top, Bottom
    'pz.png', 'nz.png'  // Front, Back
]);