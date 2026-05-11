import { describe, it, expect } from 'vitest';
import { LocalOrchestrator } from '../src/orchestrator';
import { Vault } from '../src/vault';

describe('Atomicidad de Quema (Double-Spend Test)', () => {
    it('debe detectar colisiones de doble gasto en la bóveda vulnerable', async () => {
        // El orquestador maneja el buffer real, aquí solo reseteamos si es necesario
        // Pero para el test, el orquestador ya inicializa un buffer limpio
        
        // Lanzamos 4 hilos, cada uno intentando quemar el mismo token
        const results = await LocalOrchestrator.runDoubleSpendAttack(4, 1);
        
        console.log('Resultados del Ataque:', results);

        // Con el blindaje atómico, SOLO un hilo debe tener éxito
        expect(results.successfulBurns).toBe(1);
        expect(results.totalRequests).toBe(4);
    }, 20000);
});
