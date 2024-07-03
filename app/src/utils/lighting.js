import * as THREE from 'three';

export class Light {
    constructor(scene) {
        this.scene = scene;
    }

    createAmbientLight(intensity) {
        this.ambientLight = new THREE.AmbientLight(0xffffff, intensity);
        this.scene.add(this.ambientLight);
    }

    createDirectionalLight(position, intensity) {
        this.directionalLight = new THREE.DirectionalLight(0xffffff, intensity);
        this.directionalLight.position.set(position.x, position.y, position.z);
        this.directionalLight.castShadow = true;

        // Shadow settings
        this.directionalLight.shadow.camera.top = 200;
        this.directionalLight.shadow.camera.bottom = -200;
        this.directionalLight.shadow.camera.left = -200;
        this.directionalLight.shadow.camera.right = 200;
        this.directionalLight.shadow.mapSize.width = 4096;
        this.directionalLight.shadow.mapSize.height = 2096;
        this.directionalLight.shadow.camera.near = 0.5;
        this.directionalLight.shadow.camera.far = 500;

        this.scene.add(this.directionalLight);
    }

    createHemisphericLight(skyColor, groundColor, intensity) {
        this.hemisphericLight = new THREE.HemisphereLight(skyColor, groundColor, intensity);
        this.scene.add(this.hemisphericLight);
    }

    createPointLight(intensity, distance, decay) {
        this.pointLight = new THREE.PointLight(0xFFFF11, intensity, distance, decay);
        // this.pointLight.position.set(position.x, position.y, position.z);
        this.pointLight.castShadow = true;

        // Shadow settings
        this.pointLight.shadow.mapSize.width = 1024;
        this.pointLight.shadow.mapSize.height = 1024;
        this.pointLight.shadow.camera.near = 0.5;
        this.pointLight.shadow.camera.far = 500;

        this.scene.add(this.pointLight);
    }

    createSpotLight(position, target, intensity, distance, angle, penumbra, decay) {
        this.spotLight = new THREE.SpotLight(0xffffff, intensity, distance, angle, penumbra, decay);
        this.spotLight.position.set(position.x, position.y, position.z);
        this.spotLight.target.position.set(target.x, target.y, target.z);
        this.spotLight.castShadow = true;

        // Shadow settings
        this.spotLight.shadow.mapSize.width = 1024;
        this.spotLight.shadow.mapSize.height = 1024;
        this.spotLight.shadow.camera.near = 0.5;
        this.spotLight.shadow.camera.far = 500;

        this.scene.add(this.spotLight);
        this.scene.add(this.spotLight.target);
        return this.spotLight;
    }

    setAmbientLightIntensity(intensity) {
        if (this.ambientLight) {
            this.ambientLight.intensity = intensity;
        }
    }

    setDirectionalLightPosition(position) {
        if (this.directionalLight) {
            this.directionalLight.position.set(position.x, position.y, position.z);
        }
    }

    setDirectionalLightIntensity(intensity) {
        if (this.directionalLight) {
            this.directionalLight.intensity = intensity;
        }
    }

    setHemisphericLightIntensity(intensity) {
        if (this.hemisphericLight) {
            this.hemisphericLight.intensity = intensity;
        }
    }

    setHemisphericLightColors(skyColor, groundColor) {
        if (this.hemisphericLight) {
            this.hemisphericLight.skyColor.set(skyColor);
            this.hemisphericLight.groundColor.set(groundColor);
        }
    }

    setPointLightIntensity(intensity) {
        if (this.pointLight) {
            this.pointLight.intensity = intensity;
        }
    }

    setPointLightPosition(position) {
        if (this.pointLight) {
            this.pointLight.position.set(position.x, position.y, position.z);
        }
    }
}
