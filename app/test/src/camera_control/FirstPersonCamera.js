import { Euler, Vector3 } from "three";

export class FirstPersonCamera{
    constructor(camera, pos){
        this.camera = camera;
        
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
        this.movementSpeed = 10;

        this.mouseDown = false;
        this.deltaRotate = new Euler(0,0,0);
        this.deltaTHETA = 0;
        this.deltaALPHA = 0;
        this.rotationSpeed = 1;
        
        this.bindControl();
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

            case 'R':
                this.move.u = true;
                break;
            case 'F':
                this.move.d = true;
                break;

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

            case 'R':
                this.move.u = false;
                break;
            case 'F':
                this.move.d = false;
                break;

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
        if (this.mouseDown) {
            const deltaX = (e.movementX || e.mozMovementX || e.webkitMovementX || 0) * 0.01;
            const deltaY = (e.movementY || e.mozMovementY || e.webkitMovementY || 0) * 0.01;
            this.deltaTHETA -= deltaX;
            this.deltaALPHA -= deltaY;
        }
    }
    
    bindControl(){
        document.addEventListener("keydown", (e) => this.onKeyDown(e), false);
        document.addEventListener("keyup", (e) => this.onKeyUp(e), false);
        document.addEventListener("mousedown", (e) => this.onMouseDown(e), false);
        document.addEventListener("mouseup", (e) => this.onMouseUp(e), false);
        document.addEventListener("mousemove", (e) => this.onMouseMove(e), false);
        // document.addEventListener("wheel", (e) => this.onMouseWheel(e), false);
    }
    
    update(dt) {
        console.log(this.deltaTHETA, this.deltaALPHA)
        this.updatePos(dt);
        this.camera.position.set(...this.position);

        this.deltaRotate.x = this.deltaALPHA;
        this.deltaRotate.y = this.deltaTHETA;
        this.camera.setRotationFromEuler(this.deltaRotate);
    }

    updatePos(dt){
        this.deltaMove.x = this.move.l * -1 + this.move.r * 1;
        this.deltaMove.z = this.move.b * 1 + this.move.f * -1;
        this.deltaMove.y = this.move.u * 1 + this.move.d * -1;
        this.deltaMove.applyEuler(this.camera.rotation);
        this.deltaMove.normalize();
        this.deltaMove.multiplyScalar(dt * this.movementSpeed);
        this.position.add(this.deltaMove);
    }
}