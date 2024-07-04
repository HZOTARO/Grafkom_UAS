import { Euler, Vector3, Box3, Box3Helper } from "three";
import { OBB } from "three/examples/jsm/Addons.js";

export class CameraBase{
    constructor(camera, world, pos){
        this.prevPos = new Vector3();
        this.collide = false;
        this.world = world;
        this.idle = true;
        this.camera = camera;
        this.scale = new Vector3(1,1,1);
        
        this.position = pos;
        this.camera.position.set(...this.position);
        this.move = {
            f: false,
            b: false,
            l: false,
            r: false,
            
            u:false,
            d:false
        }
        this.deltaMove = new Vector3(0,0,0);
        this.movementSpeed = 50;
        
        this.mouseDown = false;
        this.deltaRotate = new Euler(0,0,0);
        this.THETA = 0;
        this.rotationSpeed = 1;        
        
        this.bindControl();
        
        this.distance = null;
        this.ALPHA = null;
        this.minZoom = null;
        this.maxZoom = null;
        this.minALPHA = null;
        this.maxALPHA = null;
        this.zoomSpeed = null;

        this.BB = new Box3();
        this.BB.setFromCenterAndSize( this.camera.position, this.scale );
        // this.BB.setFromObject( this.model );
        this.helper = new Box3Helper( this.BB, 0xffff00 );
        // this.scene.add( this.helper );

        this.obb = new OBB();
        this.obb = this.obb.fromBox3(this.BB);
    }

    onKeyDown(e){
        switch (e.key.toUpperCase()) {
            case 'A':
                this.move.l = true;
                break;
            case 'W':
                this.move.f = true;
                break;
            case 'S':
                this.move.b = true;
                break;
            case 'D':
                this.move.r = true;
                break;

            // case 'R':
            //     this.move.u = true;
            //     break;
            // case 'F':
            //     this.move.d = true;
            //     break;

            default:
                break;
        }
    }

    onKeyUp(e){
        switch (e.key.toUpperCase()) {
            case 'A':
                this.move.l = false;
                break;
            case 'W':
                this.move.f = false;
                break;
            case 'S':
                this.move.b = false;
                break;
            case 'D':
                this.move.r = false;
                break;

            // case 'R':
            //     this.move.u = false;
            //     break;
            // case 'F':
            //     this.move.d = false;
            //     break;

            default:
                break;
        }
    }

    onMouseDown(e){
        this.mouseDown = true;
    }

    onMouseUp(e){
        this.mouseDown = false;
    }

    onMouseMove(e){
        // if (this.mouseDown) {
            const deltaX = (e.movementX || e.mozMovementX || e.webkitMovementX || 0) * 0.01;
            const deltaY = (e.movementY || e.mozMovementY || e.webkitMovementY || 0) * 0.01;
            this.THETA -= deltaX;
            this.ALPHA -= deltaY;

            this.ALPHA = Math.max(Math.min(this.maxALPHA, this.ALPHA), this.minALPHA)
        // }
    }

    onMouseWheel(e){
        this.camera.setFocalLength( Math.min(Math.max(this.minZoom, (this.camera.getFocalLength() - this.zoomSpeed * (e.deltaY / 100))), this.maxZoom));
        // this.distance = Math.min(Math.max(this.minZoom, (this.distance + this.zoomSpeed * (e.deltaY / 100))), this.maxZoom);
    }
    
    bindControl(){
        document.addEventListener("keydown", (e) => this.onKeyDown(e), false);
        document.addEventListener("keyup", (e) => this.onKeyUp(e), false);
        document.addEventListener("mousedown", (e) => this.onMouseDown(e), false);
        document.addEventListener("mouseup", (e) => this.onMouseUp(e), false);
        document.addEventListener("mousemove", (e) => this.onMouseMove(e), false);
        document.addEventListener("wheel", (e) => this.onMouseWheel(e), false);
    }

    checkCollision(){
        // console.log(this.world.BB)
        this.collide = false;
        this.world.BB.forEach(box => {
            if(this.obb.intersectsOBB(box)){
                this.collide = true;
                // this.camera.position.copy(this.prevPos);
                return;
            }
        });
    }
    
    update(dt) {
        this.prevPos.copy(this.camera.position);
        if(this.move.f||this.move.b||this.move.l||this.move.r){
            this.idle = false;
        }else{
            this.idle = true;
        }
        this.updatePos(dt);
        this.updateRotate(dt);
        // console.log(this.camera.getFocalLength())
    }

    updatePos(dt){
        this.deltaMove.x = this.move.l * -1 + this.move.r * 1;
        this.deltaMove.z = this.move.b * 1 + this.move.f * -1;
        this.deltaMove.y = this.move.u * 1 + this.move.d * -1;
        this.deltaMove.applyEuler(this.camera.rotation);
    }

    updateCameraPos(){
        this.BB.setFromCenterAndSize(this.camera.position, this.scale);
        this.obb.fromBox3(this.BB)
        this.helper.updateMatrixWorld(true);
        this.checkCollision();
    }
}