import { describe, it, expect } from 'vitest';
// @ts-ignore
import { CryptoEngine } from '../src/crypto';

describe('ADN Criptográfico (Integridad de ADN)', () => {
    it('debe fallar la validación si se altera un solo bit del mensaje cifrado (Tampering Test)', () => {
        const key = '0'.repeat(64); // Clave de 256 bits (64 hex)
        const secretMessage = { accountId: 'FINTECH-12345', amount: 1000 };
        
        const encrypted = CryptoEngine.encrypt(secretMessage, key);
        
        // Simulamos un ataque de alteración (Tampering)
        // Cambiamos el último carácter del payload cifrado
        const tamperedContent = encrypted.content.slice(0, -1) + (encrypted.content.endsWith('0') ? '1' : '0');
        
        const tamperedData = { ...encrypted, content: tamperedContent };
        
        // El sistema debe detectar la alteración y lanzar un error o devolver nulo
        expect(() => CryptoEngine.decrypt(tamperedData, key)).toThrow('BAD_DECRYPT_OR_TAMPERED');
    });
});
