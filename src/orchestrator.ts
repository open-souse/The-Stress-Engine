import { Worker } from 'worker_threads';
import * as path from 'path';

export interface StressResults {
    totalRequests: number;
    successfulBurns: number;
    doubleSpendsDetected: number;
    durationMs: number;
}

export class LocalOrchestrator {
    static async runDoubleSpendAttack(threads: number, requestsPerThread: number): Promise<StressResults> {
        const startTime = Date.now();
        const workers: Promise<any>[] = [];
        
        // Creamos un buffer compartido de 8 bytes (2 enteros de 32 bits)
        const sharedBuffer = new SharedArrayBuffer(8);
        
        console.log(`🚀 Lanzando ataque coordinado con ${threads} hilos (Memoria Compartida)...`);

        for (let i = 0; i < threads; i++) {
            workers.push(this.createWorker(requestsPerThread, sharedBuffer));
        }

        const results = await Promise.all(workers);
        
        const durationMs = Date.now() - startTime;
        
        return {
            totalRequests: threads * requestsPerThread,
            successfulBurns: results.reduce((acc, r) => acc + r.success, 0),
            doubleSpendsDetected: results.reduce((acc, r) => acc + r.conflicts, 0),
            durationMs
        };
    }

    private static createWorker(requests: number, sharedBuffer: SharedArrayBuffer): Promise<{success: number, conflicts: number}> {
        return new Promise((resolve, reject) => {
            const workerPath = path.join(__dirname, 'worker.ts');
            const worker = new Worker(`
                require('ts-node').register();
                require('${workerPath.replace(/\\/g, '/')}');
            `, { 
                eval: true,
                workerData: { requests, sharedBuffer } 
            });
            worker.on('message', resolve);
            worker.on('error', (err) => {
                console.error('❌ ERROR CRÍTICO EN WORKER:', err);
                reject(err);
            });
        });
    }
}
