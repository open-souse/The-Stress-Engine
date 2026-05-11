import * as fs from 'fs';
import * as path from 'path';

export interface ReportData {
    phase: string;
    target: string;
    timestamp: string;
    metrics: any;
    verdict: 'PASS' | 'FAIL';
}

export class Reporter {
    static generateJSON(data: ReportData, outputPath: string) {
        fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
    }

    static generateMarkdown(data: ReportData, outputPath: string) {
        const md = `
# 🛡️ THE STRESS ENGINE - AUDIT REPORT
> **Fase:** ${data.phase}
> **Objetivo:** ${data.target}
> **Fecha:** ${data.timestamp}
> **Veredicto:** ${data.verdict === 'PASS' ? '🟢 APROBADO' : '🔴 FALLIDO'}

## 📊 Métricas de Ejecución
\`\`\`json
${JSON.stringify(data.metrics, null, 2)}
\`\`\`

---
*Reporte generado automáticamente por The Stress Engine Open Source.*
        `;
        fs.writeFileSync(outputPath, md.trim());
    }

    static generateHTML(data: ReportData, outputPath: string) {
        const html = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Audit Report - The Stress Engine</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        body { font-family: 'Inter', sans-serif; background: #0f172a; color: #f8fafc; padding: 40px; }
        .card { background: #1e293b; border-radius: 12px; padding: 24px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); margin-bottom: 24px; }
        .badge { padding: 8px 16px; border-radius: 9999px; font-weight: bold; }
        .pass { background: #065f46; color: #34d399; }
        .fail { background: #991b1b; color: #f87171; }
        h1 { color: #38bdf8; }
    </style>
</head>
<body>
    <h1>🛡️ The Stress Engine Report</h1>
    <div class="card">
        <p><strong>Fase:</strong> ${data.phase}</p>
        <p><strong>Objetivo:</strong> ${data.target}</p>
        <p><strong>Veredicto:</strong> <span class="badge ${data.verdict.toLowerCase()}">${data.verdict}</span></p>
    </div>
    <div class="card">
        <canvas id="auditChart"></canvas>
    </div>
    <script>
        const ctx = document.getElementById('auditChart');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Total', 'Éxitos', 'Errores'],
                datasets: [{
                    label: 'Métricas de Auditoría',
                    data: [${data.metrics.totalRequests || 0}, ${data.metrics.totalRequests - (data.metrics.errors || 0)}, ${data.metrics.errors || 0}],
                    backgroundColor: ['#38bdf8', '#34d399', '#f87171']
                }]
            },
            options: { scales: { y: { beginAtZero: true } } }
        });
    </script>
</body>
</html>
        `;
        fs.writeFileSync(outputPath, html.trim());
    }
}
