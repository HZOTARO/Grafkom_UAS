export function initEventListeners(environment) {
    document.addEventListener('keydown', (event) => {
        if (event.key === 'n') {  // Use 'n' instead of 'keyN'
            console.log('hello');
            environment.setNightMode();
        }
    }, false);
}
