import { Environment } from './modules/Environment.js'; // Pastikan path sesuai dengan struktur direktori

let environment = null;

async function init() {
    environment = new Environment();
}

init();
