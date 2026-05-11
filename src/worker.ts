import { parentPort, workerData } from 'worker_threads';
import { Vault } from './vault';

async function attack() {
    const { requests, sharedBuffer } = workerData;
    const view = new Int32Array(sharedBuffer);
    let success = 0;
    let conflicts = 0;

    for (let i = 0; i < requests; i++) {
        // Atacamos el buffer compartido
        const ok = Vault.burnTokenShared(view);
        if (ok) {
            success++;
        } else {
            conflicts++;
        }
    }

    parentPort?.postMessage({ success, conflicts });
}

attack().catch(err => console.error(err));
