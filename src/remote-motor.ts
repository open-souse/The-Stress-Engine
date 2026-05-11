import axios from 'axios';
import { performance } from 'perf_hooks';

export interface RemoteMetrics {
    totalRequests: number;
    successRate: number;
    avgLatency: number;
    p99Latency: number;
    errors: number;
}

export class RemoteMotor {
    /**
     * Ejecuta una ráfaga de ataques contra una URL específica.
     * Mide latencia individual para calcular el P99.
     */
    static async probe(targetUrl: string, batchSize: number): Promise<RemoteMetrics> {
        const latencies: number[] = [];
        let successCount = 0;
        let errorCount = 0;

        const requests = Array.from({ length: batchSize }).map(async () => {
            const start = performance.now();
            try {
                // Sonda ligera: Solo HEAD o GET pequeño para medir infraestructura
                await axios.get(targetUrl, { timeout: 5000 });
                latencies.push(performance.now() - start);
                successCount++;
            } catch (err) {
                errorCount++;
            }
        });

        await Promise.allSettled(requests);

        // Cálculo de P99
        latencies.sort((a, b) => a - b);
        const p99Index = Math.floor(latencies.length * 0.99);
        const p99 = latencies[p99Index] || 0;
        const avg = latencies.reduce((a, b) => a + b, 0) / latencies.length || 0;

        return {
            totalRequests: batchSize,
            successRate: (successCount / batchSize) * 100,
            avgLatency: avg,
            p99Latency: p99,
            errors: errorCount
        };
    }

    /**
     * Algoritmo de Ramp-up: Incrementa la carga progresivamente hasta encontrar el límite.
     */
    static async runRampUp(targetUrl: string, maxDurationMs: number) {
        let batchSize = 100;
        const startTime = Date.now();
        
        console.log(`📡 Iniciando Ramp-up contra: ${targetUrl}`);

        let lastMetrics: any;
        while (Date.now() - startTime < maxDurationMs) {
            const metrics = await this.probe(targetUrl, batchSize);
            lastMetrics = metrics;
            const elapsedMin = ((Date.now() - startTime) / 1000 / 60).toFixed(2);
            
            console.log(`[${elapsedMin} min] Batch: ${batchSize} | P99: ${metrics.p99Latency.toFixed(2)}ms | Éxito: ${metrics.successRate.toFixed(2)}%`);
            
            // Criterios de parada (Límite de Estabilidad)
            if (metrics.successRate < 90 || (metrics.p99Latency > 2000 && batchSize > 500)) {
                console.log('--------------------------------------------------');
                console.log(`⚠️  LÍMITE DE ESTABILIDAD ALCANZADO: ${batchSize} reqs/batch`);
                console.log(`📉 Latencia P99 crítica: ${metrics.p99Latency.toFixed(2)}ms`);
                break;
            }

            batchSize += 100;
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        return { totalRequests: batchSize, errors: lastMetrics?.errors || 0, p99: lastMetrics?.p99Latency || 0 };
    }

    /**
     * Algoritmo de Inundación: Mantiene una carga constante para probar durabilidad.
     */
    static async runFlood(targetUrl: string, batchSize: number, durationMs: number) {
        const startTime = Date.now();
        let totalRequests = 0;
        let totalErrors = 0;
        let lastP99 = 0;

        console.log(`🌊 INICIANDO INUNDACIÓN CONSTANTE: ${targetUrl}`);
        console.log(`📊 Carga: ${batchSize} reqs/batch | Duración: ${(durationMs / 1000 / 60).toFixed(0)} min`);

        while (Date.now() - startTime < durationMs) {
            const metrics = await this.probe(targetUrl, batchSize);
            totalRequests += metrics.totalRequests;
            totalErrors += metrics.errors;
            lastP99 = metrics.p99Latency;

            const elapsedMin = ((Date.now() - startTime) / 1000 / 60).toFixed(2);
            console.log(`[${elapsedMin} min] Total: ${totalRequests.toLocaleString()} | P99: ${metrics.p99Latency.toFixed(2)}ms | Errores: ${totalErrors}`);

            await new Promise(resolve => setImmediate(resolve));
        }

        return { totalRequests, errors: totalErrors, p99: lastP99 };
    }
}
