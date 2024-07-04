export function initEventListeners(environment) {
    document.addEventListener('keydown', (event) => {
        if (event.key === 'n') {  // Use 'n' instead of 'keyN'
            environment.setNightMode();
        }
        else if (event.key === 'm') {
            environment.setDayMode();
        }
    }, false);
}
