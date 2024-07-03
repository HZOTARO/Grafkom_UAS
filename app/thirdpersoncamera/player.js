import * as THREE from "three";
import { FBXLoader } from "three/addons/loaders/FBXLoader.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

export class Player {
  constructor(camera,scene, speed,positionObject) {
    this.camera = camera;
    this.controller = new PlayerController(camera,positionObject); // Pass the camera here
    this.scene = scene;
    this.speed = speed;
    this.state = "idle";
    this.rotationVector = new THREE.Vector3(0, 0, 0);
    this.animations = {};
    this.lastRotation = 0;
    this.positionObject = positionObject;

    this.camera.setup(positionObject);

    this.loadModel();
  }

  loadModel() {
    var loader = new FBXLoader();
    loader.setPath("sonic1/");
    loader.load("untitled.fbx", (fbx) => {
      // fbx.scale.setScalar(0.024);
      fbx.traverse((c) => {
        c.castShadow = true;
        c.receiveShadow = true; // Menambahkan receiveShadow pada setiap mesh
      });
      this.mesh = fbx;
      this.scene.add(this.mesh);
      this.mesh.position.set(this.positionObject.x,this.positionObject.y,this.positionObject.z);
      this.mesh.scale.set(0.09, 0.09, 0.09);
      this.mesh.rotation.y += Math.PI / -2;
      this.mesh.castShadow = true;
      this.mesh.receiveShadow = true;

      this.mixer = new THREE.AnimationMixer(this.mesh);

      var onLoad = (animName, anim) => {
        const clip = anim.animations[14]; //6,14
        const action = this.mixer.clipAction(clip);
        action.timeScale = 4;

        this.animations[animName] = {
          clip: clip,
          action: action,
        };
      };

      const loader = new FBXLoader();
      loader.setPath("sonic1/");
      loader.load("untitled.fbx", (fbx) => {
        onLoad("idle", fbx);
      });
      //loader.load('untitled.fbx', (fbx) => { onLoad('run', fbx) });
    });
  }

  update(dt) {
    if (this.mesh && this.animations) {
      this.lastRotation = this.mesh.rotation.y;

      var forwardVector = new THREE.Vector3();
      this.camera.camera.getWorldDirection(forwardVector);
      forwardVector.normalize();
      forwardVector = new THREE.Vector3(forwardVector.x,0,forwardVector.z);
      


      var direction = new THREE.Vector3(0, 0, 0);

      if (this.controller.keys["forward"]) {
        this.mesh.position.add(
          forwardVector.multiplyScalar(dt * this.speed)
        );
        const angle = Math.atan2(forwardVector.x, forwardVector.z);
        this.mesh.rotation.y = angle;
        console.log(angle);
      }
      if (this.controller.keys["backward"]) {
        this.mesh.position.add(
          forwardVector.multiplyScalar(dt * -this.speed)
        );
        const angle = Math.atan2(forwardVector.x, forwardVector.z);
        this.mesh.rotation.y = angle;
      }
      if (this.controller.keys["left"]) {
        // Calculate left vector by rotating the forward vector 90 degrees around the up axis
        const leftVector = new THREE.Vector3(forwardVector.z, 0, -forwardVector.x).normalize();
        this.mesh.position.add(
          leftVector.multiplyScalar(dt * this.speed)
        );
        const angle = Math.atan2(forwardVector.x, forwardVector.z);
        this.mesh.rotation.y = angle + Math.PI/2;
      }
      if (this.controller.keys["right"]) {
        // Calculate right vector by rotating the forward vector -90 degrees around the up axis
        const rightVector = new THREE.Vector3(-forwardVector.z, 0, forwardVector.x).normalize();
        this.mesh.position.add(
          rightVector.multiplyScalar(dt * this.speed)
        );
        const angle = Math.atan2(forwardVector.x, forwardVector.z);
        this.mesh.rotation.y = angle - Math.PI/2;
      }
      this.lastRotation = this.mesh.rotation.y;
      if (direction.length() == 0) {
        if (this.animations["idle"]) {
          if (this.state != "idle") {
            this.mixer.stopAllAction();
            this.state = "idle";
          }
          this.mixer.clipAction(this.animations["idle"].clip).play();
        }
      } else {
        if (this.animations["run"]) {
          if (this.state != "run") {
            this.mixer.stopAllAction();
            this.state = "run";
          }
          this.mixer.clipAction(this.animations["run"].clip).play();
        }
      }

      if (this.controller.mouseDown) {
        var dtMouse = this.controller.deltaMousePos;
        dtMouse.x = dtMouse.x / Math.PI;
        dtMouse.y = dtMouse.y / Math.PI;

        // this.rotationVector.y += dtMouse.x * dt * 10;
        // this.rotationVector.z += dtMouse.y * dt * 10;
        this.rotationVector.y += dtMouse.x * dt * 0; // untuk dia tidak rotate pas diem
        this.rotationVector.z += dtMouse.y * dt * 0;
      }
      this.mesh.rotation.y += this.rotationVector.y;

      // var forwardVector = new THREE.Vector3(1, 0, 0);
      // var rightVector = new THREE.Vector3(0, 0, 1);
      // forwardVector.applyAxisAngle(
      //   new THREE.Vector3(0, 1, 0),
      //   this.rotationVector.y
      // );
      // rightVector.applyAxisAngle(
      //   new THREE.Vector3(0, 1, 0),
      //   this.rotationVector.y
      // );


      

      this.camera.setup(this.positionObject);

      this.positionObject = this.mesh.position;

      if (this.mixer) {
        this.mixer.update(dt);
      }
    }
  }
}

export class PlayerController {
  constructor(ThirdPersonCamera,positionObject) { // Add camera parameter here
    this.keys = {
      forward: false,
      backward: false,
      left: false,
      right: false,
    };
    this.mousePos = new THREE.Vector2();
    this.mouseDown = false;
    this.deltaMousePos = new THREE.Vector2();
    this.ThirdPersonCamera = ThirdPersonCamera; // Store camera reference

    // Variables for rotation around a specific point
    this.center = positionObject; // Center of rotation, e.g., origin
    

    document.addEventListener("keydown", (e) => this.onKeyDown(e), false);
    document.addEventListener("keyup", (e) => this.onKeyUp(e), false);
    document.addEventListener("mousemove", (e) => this.onMouseMove(e), false);
    document.addEventListener("mousedown", (e) => this.onMouseDown(e), false);
    document.addEventListener("mouseup", (e) => this.onMouseUp(e), false);
    document.addEventListener("wheel", (e) => this.onMouseWheel(e), false); // Add this line
  }
  onMouseDown(event) {
    this.mouseDown = true;
  }
  onMouseUp(event) {
    this.mouseDown = false;
  }
  onMouseMove(event) {
    if (!this.mouseDown) return;

    this.center = this.ThirdPersonCamera.positionObject;
    console.log(this.center);

    const deltaX = (event.movementX || event.mozMovementX || event.webkitMovementX || 0) * 0.01; // Convert mouse position to angle
    const deltaY = (event.movementY || event.mozMovementY || event.webkitMovementY || 0) * 0.01; // Vertical rotation

    this.ThirdPersonCamera.theta += deltaX; // Update theta based on horizontal movement
    this.ThirdPersonCamera.phi += deltaY; // Update phi based on vertical movement
    // Ensure phi stays within the range of [-π/2, π/2] to avoid flipping the camera
    this.ThirdPersonCamera.phi = Math.max(-Math.PI / 2 + 0.01, Math.min(Math.PI / 2 - 0.01, this.ThirdPersonCamera.phi));


    this.ThirdPersonCamera.updateCameraPosition();
    this.ThirdPersonCamera.camera.lookAt(this.center);

  }
  onMouseWheel(event) { // Add this function
    if (this.camera && this.camera.zoom) {
      if (event.deltaY < 0) {
        this.ThirdPersonCamera.zoom(-1); // Zoom in
      } else if (event.deltaY > 0) {
        this.ThirdPersonCamera.zoom(1); // Zoom out
      }
    }
  }
  onKeyDown(event) {
    switch (event.keyCode) {
      case "W".charCodeAt(0):
      case "w".charCodeAt(0):
        this.keys["forward"] = true;
        break;
      case "S".charCodeAt(0):
      case "s".charCodeAt(0):
        this.keys["backward"] = true;
        break;
      case "A".charCodeAt(0):
      case "a".charCodeAt(0):
        this.keys["left"] = true;
        break;
      case "D".charCodeAt(0):
      case "d".charCodeAt(0):
        this.keys["right"] = true;
        break;
    }
  }
  onKeyUp(event) {
    switch (event.keyCode) {
      case "W".charCodeAt(0):
      case "w".charCodeAt(0):
        this.keys["forward"] = false;
        break;
      case "S".charCodeAt(0):
      case "s".charCodeAt(0):
        this.keys["backward"] = false;
        break;
      case "A".charCodeAt(0):
      case "a".charCodeAt(0):
        this.keys["left"] = false;
        break;
      case "D".charCodeAt(0):
      case "d".charCodeAt(0):
        this.keys["right"] = false;
        break;
    }
  }
}

export class ThirdPersonCamera {
  constructor(camera, positionOffSet, targetOffSet) {
    this.camera = camera;
    this.positionOffSet = positionOffSet;
    this.targetOffSet = targetOffSet;
    this.zoomLevel = 1; // Default zoom level

    this.camera.rotation.order = 'YXZ'; // Set rotation order if needed
    this.doOnce = false;
    this.radius = 100; // Radius from center to camera position
    this.positionObject = 0;

    this.theta = 0;
    this.phi = 0;
  }
  // setup(target, angle) {
  //   var temp = new THREE.Vector3(0, 0, 0);
  //   temp.copy(this.positionOffSet);
  //   temp.multiplyScalar(this.zoomLevel); // Apply zoom level

  //   // Apply rotations (roll, pitch, yaw)
  //   var roll = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 0, 1), angle.x);
  //   var pitch = new THREE.Vector3(0, 1, 0).applyAxisAngle(new THREE.Vector3(1, 0, 0), angle.y);
  //   var yaw = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), angle.z);
    
  //   temp.applyAxisAngle(roll, angle.x);
  //   temp.applyAxisAngle(pitch, angle.y);
  //   temp.applyAxisAngle(yaw, angle.z);

  //   temp.add(target);

  //   this.camera.position.copy(temp);

  //   var newTarget = new THREE.Vector3(0, 0, 0);
  //   newTarget.copy(this.targetOffSet);
  //   newTarget.add(target);

  //   this.camera.lookAt(newTarget);
  // }
  // Function to update camera position based on rotation
  updateCameraPosition() {
    const x = this.positionObject.x + this.radius * Math.sin(this.theta);
    const y = this.positionObject.y + this.radius * Math.sin(this.phi);
    const z = this.positionObject.z + this.radius * Math.cos(this.theta);
    this.camera.position.set(x, y, z);
  }
  setup(positionObject) {
    if(!this.doOnce){
      this.doOnce = true;
      this.camera.lookAt(positionObject);
      
    }
    this.positionObject = positionObject;
    this.updateCameraPosition(this.theta,this.phi);

  }
  zoom(deltaZoom) {
    this.zoomLevel += deltaZoom * 0.1;
    this.zoomLevel = Math.max(0.5, Math.min(this.zoomLevel, 2)); // Clamp zoom level between 0.5 and 2
  }
}
