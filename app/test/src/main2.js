// Import Three.js
import * as THREE from 'three';

// Create the scene
const scene = new THREE.Scene();

// Create a camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 10;

// Create the renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create two Box3 objects with different centers and sizes
let center1 = new THREE.Vector3(-1, 0, 0);
const size1 = new THREE.Vector3(3, 3, 3);
const box1 = new THREE.Box3().setFromCenterAndSize(center1, size1);

let center2 = new THREE.Vector3(1, 0, 0);
const size2 = new THREE.Vector3(3, 3, 3);
const box2 = new THREE.Box3().setFromCenterAndSize(center2, size2);

// Create Box3Helpers to visualize the bounding boxes
const helper1 = new THREE.Box3Helper(box1, 0xff0000); // Red color for the first box
const helper2 = new THREE.Box3Helper(box2, 0x0000ff); // Blue color for the second box
scene.add(helper1);
scene.add(helper2);

// Create the intersected box
const intersectBox = new THREE.Box3();

// Create a Box3Helper to visualize the intersected bounding box
const intersectHelper = new THREE.Box3Helper(intersectBox, 0x00ff00); // Green color for the intersection
scene.add(intersectHelper);

// Function to update the Box3 positions and intersection
function updateBoxes() {
    // Update the center positions (for example, animate them)
    center1.x += 0.01;
    center2.x -= 0.01;

    // Update the boxes with new positions
    box1.setFromCenterAndSize(center1, size1);
    box2.setFromCenterAndSize(center2, size2);

    // Recalculate the intersection
    intersectBox.copy(box1).intersect(box2);

    // Update the helpers
    helper1.updateMatrixWorld(true);
    helper2.updateMatrixWorld(true);
    intersectHelper.updateMatrixWorld(true);
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    updateBoxes(); // Update box positions and intersection
    renderer.render(scene, camera);
}

animate();

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
