import express from 'express';

const app = express();
const port = 3000;

let requestCount = 0;

app.get('/', (req, res) => {
    requestCount++;
    
    // Simulación de Fatiga: 
    // Después de 1000 peticiones, el servidor empieza a tardar más (Latencia)
    // Después de 5000 peticiones, empieza a fallar (Errores 500)
    
    let delay = 10; // Latencia base de 10ms
    
    if (requestCount > 1000) {
        delay = Math.min(2500, (requestCount - 1000) * 0.5); // Sube la latencia progresivamente
    }

    if (requestCount > 5000 && Math.random() > 0.8) {
        return res.status(500).send('SERVER_OVERLOAD');
    }

    setTimeout(() => {
        res.send({ status: 'OK', processed: requestCount });
    }, delay);
});

app.listen(port, () => {
    console.log(`🏦 Servidor Fintech Simulado corriendo en http://localhost:${port}`);
    console.log('Target de auditoría listo para la Fase 3.');
});
