import chalk from 'chalk';
import Table from 'cli-table3';
const SingleBar = require('cli-progress').SingleBar;
const Presets = require('cli-progress').Presets;

export class Visualizer {
    private static progressBar: any;

    static clear() {
        process.stdout.write('\x1Bc'); // Limpia la pantalla de terminal
    }

    static showHeader(target: string, duration: number, intensity: string) {
        console.log(chalk.blue.bold('\n 🛡️  THE STRESS ENGINE - DASHBOARD PREMIUM'));
        console.log(chalk.gray('--------------------------------------------------'));
        console.log(`${chalk.cyan('🎯 Objetivo:')} ${target.toUpperCase()}`);
        console.log(`${chalk.cyan('⏱️  Duración:')} ${duration} minutos`);
        console.log(`${chalk.cyan('🔥 Intensidad:')} ${intensity.toUpperCase()}`);
        console.log(chalk.gray('--------------------------------------------------\n'));
    }

    static initProgressBar(totalSeconds: number) {
        this.progressBar = new SingleBar({
            format: chalk.cyan('🚀 Estrés en curso |') + chalk.blue('{bar}') + '| {percentage}% || {value}/{total} seg',
            barCompleteChar: '\u2588',
            barIncompleteChar: '\u2591',
            hideCursor: true
        }, Presets.shades_classic);

        this.progressBar.start(totalSeconds, 0);
    }

    static updateProgress(seconds: number) {
        this.progressBar.update(seconds);
    }

    static stopProgress() {
        this.progressBar.stop();
    }

    static drawMetricsTable(metrics: any) {
        const table = new Table({
            head: [chalk.yellow('Métrica'), chalk.yellow('Valor')],
            colWidths: [25, 25]
        });

        table.push(
            ['Total Peticiones', metrics.totalRequests?.toLocaleString() || '0'],
            ['Éxitos', chalk.green(metrics.success?.toLocaleString() || '0')],
            ['Conflictos/Errores', chalk.red(metrics.conflicts?.toLocaleString() || metrics.errors?.toLocaleString() || '0')],
            ['Latencia P99', metrics.p99 ? chalk.magenta(`${metrics.p99.toFixed(2)}ms`) : 'N/A']
        );

        console.log('\n' + table.toString());
    }
}
