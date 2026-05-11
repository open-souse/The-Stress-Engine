# 🤝 Guía de Contribución

¡Gracias por interesarte en mejorar **The Stress Engine**! Como herramienta de auditoría Fintech, mantenemos estándares muy altos de calidad de código.

## 🛠️ Cómo empezar
1. Haz un Fork del repositorio.
2. Crea una rama para tu feature: `git checkout -b feature/nueva-mejoras`.
3. Asegúrate de que todos los tests pasen: `npm test`.
4. Si añades un nuevo motor, debe incluir su propia lógica de auditoría y reporte.

## 🛡️ Estándares de Seguridad
- No aceptamos código que debilite la integridad criptográfica.
- Todo nuevo motor debe ser capaz de reportar métricas P99.
- El uso de `Atomics` es obligatorio para cualquier lógica de sincronización multihilo.

## 📝 Reporte de Bugs
Si encuentras un fallo de seguridad o un error en el motor, abre un "Issue" detallando el hardware usado y el comando que generó el error.

---
*Juntos construimos el motor de estrés más potente del ecosistema Fintech.*
