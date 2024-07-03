export function initEventListeners(environment) {
    document.addEventListener('keydown', (event) => {
        environment.keyDisplayQueue.down(event.key);
        if (event.shiftKey && environment.characterControls) {
            environment.characterControls.switchRunToggle();
        } else {
            environment.keysPressed[event.code] = true;
            if (event.code === 'KeyF') {
                environment.toggleMode('fly');
            } else if (event.code === 'KeyG') {
                environment.toggleMode('walk');
            }
        }
    }, false);

    document.addEventListener('keyup', (event) => {
        environment.keyDisplayQueue.up(event.key);
        environment.keysPressed[event.code] = false;
    }, false);
}
