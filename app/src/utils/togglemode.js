export function toggleMode(environment, mode) {
    if (mode === 'fly') {
        environment.isFlying = true;
        environment.flyControls.lock();
        environment.orbitControls.enabled = false;
    } else if (mode === 'walk') {
        environment.isFlying = false;
        environment.flyControls.unlock();
        environment.orbitControls.enabled = true;
    }
}
