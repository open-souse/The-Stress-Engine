import { CryptoEngine } from './crypto';
import { LocalOrchestrator } from './orchestrator';
import { Reporter, ReportData } from './reporter';
import { Visualizer } from './ui';
import * as os from 'os';
import * as path from 'path';

async function runDynamicStress() {
    // 1. Captura de Argumentos (CLI Flags)
    const args = process.argv.slice(2);
    const target = getArgValue(args, '--target', 'concurrency', 1);
    const durationMin = parseInt(getArgValue(args, '--duration', '30', 2));
    const intensity = getArgValue(args, '--intensity', 'medium', 3);

    // 2. Mapeo de Intensidad a Hilos
    const cpuCores = os.cpus().length;
    let threads = 4;
    if (intensity === 'low') threads = 2;
    if (intensity === 'high') threads = 8;
    if (intensity === 'extreme') threads = cpuCores;

    Visualizer.clear();
    Visualizer.showHeader(target, durationMin, intensity);
    Visualizer.initProgressBar(durationMin * 60);

    const startTime = Date.now();
    const durationMs = durationMin * 60 * 1000;
    
    // Intervalo para actualizar la barra de progreso visual
    const uiInterval = setInterval(() => {
        const elapsedSec = Math.floor((Date.now() - startTime) / 1000);
        Visualizer.updateProgress(elapsedSec);
    }, 1000);
    
    let finalMetrics: any;
    if (target === 'crypto') {
        finalMetrics = await runCryptoStress(durationMs);
    } else if (target === 'remote') {
        const url = getArgValue(args, '--url', 'http://localhost:3000', 4);
        const mode = getArgValue(args, '--mode', 'rampup', 5);
        const { RemoteMotor } = require('./remote-motor');
        
        if (mode === 'flood') {
            const batchSize = parseInt(getArgValue(args, '--batch', '500', 6));
            finalMetrics = await RemoteMotor.runFlood(url, batchSize, durationMs);
        } else {
            finalMetrics = await RemoteMotor.runRampUp(url, durationMs);
        }
    } else {
        finalMetrics = await runConcurrencyStress(durationMs, threads);
    }

    // Detener UI
    clearInterval(uiInterval);
    Visualizer.stopProgress();
    Visualizer.drawMetricsTable(finalMetrics);

    // 3. Generación de Reporte Automático
    const report: ReportData = {
        phase: 'Auditoría Dinámica',
        target: target,
        timestamp: new Date().toISOString(),
        metrics: finalMetrics,
        verdict: (finalMetrics.errors || 0) === 0 ? 'PASS' : 'FAIL'
    };

    const outputDir = path.join(process.cwd(), 'reports');
    if (!require('fs').existsSync(outputDir)) require('fs').mkdirSync(outputDir);

    Reporter.generateJSON(report, path.join(outputDir, 'report.json'));
    Reporter.generateMarkdown(report, path.join(outputDir, 'report.md'));
    Reporter.generateHTML(report, path.join(outputDir, 'report.html'));

    console.log('--------------------------------------------------');
    console.log(`✅ REPORTES GENERADOS EN: ${outputDir}`);
    console.log('--------------------------------------------------');
}

async function runCryptoStress(durationMs: number) {
    const startTime = Date.now();
    const key = '0'.repeat(64);
    const data = { id: 'STRESS-TEST', ts: Date.now() };
    let cycles = 0;

    while (Date.now() - startTime < durationMs) {
        const encrypted = CryptoEngine.encrypt(data, key);
        CryptoEngine.decrypt(encrypted, key);
        cycles++;
        if (cycles % 10000 === 0) {
            await new Promise(resolve => setImmediate(resolve));
        }
    }

    return { totalRequests: cycles, errors: 0 };
}

async function runConcurrencyStress(durationMs: number, threads: number) {
    const startTime = Date.now();
    let totalAttacks = 0;
    let totalConflicts = 0;

    while (Date.now() - startTime < durationMs) {
        const results = await LocalOrchestrator.runDoubleSpendAttack(threads, 1000);
        totalAttacks += results.totalRequests;
        totalConflicts += results.doubleSpendsDetected;
        
        await new Promise(resolve => setImmediate(resolve));
    }

    return { totalRequests: totalAttacks, success: totalAttacks - totalConflicts, errors: 0, conflicts: totalConflicts };
}

function getArgValue(args: string[], flag: string, defaultValue: string, position?: number): string {
    const index = args.indexOf(flag);
    if (index !== -1 && args[index + 1]) {
        return args[index + 1];
    }
    // Si no hay flag, intentamos por posición
    if (position !== undefined && args[position]) {
        return args[position];
    }
    return defaultValue;
}

runDynamicStress().catch(console.error);
