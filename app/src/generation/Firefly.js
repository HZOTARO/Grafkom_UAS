import * as THREE from 'three';

export class Firefly {
    constructor(scene, color = 0xffffff) {
        this.scene = scene;
        this.color = color;

        // Create the firefly light
        this.light = new THREE.PointLight(this.color, 0.7, 2.0);

        // Create the firefly mesh
        const geometry = new THREE.IcosahedronGeometry(0.05, 0);
        const material = new THREE.MeshBasicMaterial({ color: this.color });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.add(this.light);

        // Create the glow effect
        this.glowMaterial = new THREE.MeshBasicMaterial({
            color: this.color,
            transparent: true,
            opacity: 0.15
        });

        this.glowMeshes = [];
        [1.5, 2.5, 4, 6].forEach(scale => {
            const glowMesh = new THREE.Mesh(geometry, this.glowMaterial);
            glowMesh.scale.multiplyScalar(scale);
            this.mesh.add(glowMesh);
            this.glowMeshes.push(glowMesh);
        });

        // Create the circle for movement
        this.circle = new THREE.Object3D();
        this.circle.position.y = Math.random() * 5 + 1;
        const radius = Math.random() * 1.5 + 0.5;
        this.mesh.position.x = radius;
        this.circle.rotation.x = THREE.MathUtils.degToRad(90);
        this.circle.rotation.y = Math.random() * Math.PI * 2;
        this.circle.add(this.mesh);

        this.scene.add(this.circle);

        // Animation parameters
        this.rate = Math.random() * 0.05 + 0.005;
    }

    update() {
        // console.log('Updating firefly position before:', this.circle.rotation.z);
        this.circle.rotation.z += this.rate;
        // console.log('Updating firefly position after:', this.circle.rotation.z);
    }

}

export function generateFireflyCluster(scene, count, color = 0xffffff, clusterPosition = new THREE.Vector3()) {
    const fireflies = [];

    for (let i = 0; i < count; i++) {
        const firefly = new Firefly(scene, color);

        // Optionally, set individual positions based on some logic
        const x = clusterPosition.x + (Math.random() * 10 - 5); // Example range for x position around clusterPosition
        const y = clusterPosition.y + (Math.random() * 10 - 5); // Example range for y position around clusterPosition
        const z = clusterPosition.z + (Math.random() * 10 - 5); // Example range for z position around clusterPosition
        firefly.circle.position.set(x, y, z);

        fireflies.push(firefly);
        // console.log('fireflies generated');
    }

    return fireflies;
}
