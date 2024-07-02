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
        this.directionalLight.shadow.camera.top = 20;
        this.directionalLight.shadow.camera.bottom = -20;
        this.directionalLight.shadow.camera.left = -20;
        this.directionalLight.shadow.camera.right = 20;
        this.directionalLight.shadow.mapSize.width = 1024;
        this.directionalLight.shadow.mapSize.height = 1024;
        this.directionalLight.shadow.camera.near = 0.5;
        this.directionalLight.shadow.camera.far = 500;

        this.scene.add(this.directionalLight);
    }

    createSpotLight(position, intensity, angle) {
        this.spotLight = new THREE.SpotLight(0xFF1111, intensity);
        this.spotLight.position.set(position.x, position.y, position.z);
        this.spotLight.angle = angle;
        this.spotLight.distance = 1000;
        this.spotLight.penumbra = 0.1;
        this.spotLight.decay = 2;
        this.spotLight.castShadow = true;

        // Shadow settings
        this.spotLight.shadow.camera.top = 20;
        this.spotLight.shadow.camera.bottom = -20;
        this.spotLight.shadow.camera.left = -20;
        this.spotLight.shadow.camera.right = 20;
        this.spotLight.shadow.mapSize.width = 1024;
        this.spotLight.shadow.mapSize.height = 1024;
        this.spotLight.shadow.camera.near = 0.5;
        this.spotLight.shadow.camera.far = 500;

        this.scene.add(this.spotLight);
    }

    createHemisphericLight(skyColor, groundColor, intensity) {
        this.hemisphericLight = new THREE.HemisphereLight(skyColor, groundColor, intensity);
        this.scene.add(this.hemisphericLight);
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

    setSpotLightPosition(position) {
        if (this.spotLight) {
            this.spotLight.position.set(position.x, position.y, position.z);
        }
    }

    setSpotLightAngle(angle) {
        if (this.spotLight) {
            this.spotLight.angle = angle;
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
}
