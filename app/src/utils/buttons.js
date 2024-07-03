export function createButtons(environmentInstance) {
    const flyBtn = createButton('Fly Mode (F)', '10px', '10px', () => environmentInstance.toggleMode('fly'));
    const walkBtn = createButton('Walk Mode (G)', '10px', '120px', () => environmentInstance.toggleMode('walk'));
    const dayBtn = createButton('Day Mode', '10px', '250px', () => environmentInstance.setDayMode());
    const nightBtn = createButton('Night Mode', '10px', '350px', () => environmentInstance.setNightMode());
    document.body.appendChild(flyBtn);
    document.body.appendChild(walkBtn);
    document.body.appendChild(dayBtn);
    document.body.appendChild(nightBtn);
}

function createButton(innerText, top, left, onClick) {
    const button = document.createElement('button');
    button.innerText = innerText;
    button.style.position = 'absolute';
    button.style.top = top;
    button.style.left = left;
    button.addEventListener('click', onClick);
    return button;
}
