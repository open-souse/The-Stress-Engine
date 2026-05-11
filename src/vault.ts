export class Vault {
    /**
     * Versión ATÓMICA usando SharedArrayBuffer para memoria compartida entre hilos.
     * index 0: Estado del token (0 = libre, 1 = quemado)
     * index 1: Lock Mutex (0 = libre, 1 = bloqueado)
     */
    static burnTokenShared(buffer: Int32Array): boolean {
        // 1. Intentar adquirir el bloqueo de forma atómica (Spin-lock)
        // Atomics.compareExchange devuelve el valor original. 
        // Si era 0 y logramos poner 1, tenemos el lock.
        let acquired = false;
        for (let i = 0; i < 1000; i++) { // Reintento limitado para evitar bucles infinitos
            if (Atomics.compareExchange(buffer, 1, 0, 1) === 0) {
                acquired = true;
                break;
            }
        }

        if (!acquired) return false; // No se pudo obtener el lock (colisión extrema)

        try {
            // 2. Verificar si ya está quemado
            if (Atomics.load(buffer, 0) === 1) {
                return false;
            }

            // 3. Quemar token atómicamente
            Atomics.store(buffer, 0, 1);
            return true;
        } finally {
            // 4. Liberar lock
            Atomics.store(buffer, 1, 0);
        }
    }

    static reset(buffer: Int32Array) {
        Atomics.store(buffer, 0, 0);
        Atomics.store(buffer, 1, 0);
    }
}
