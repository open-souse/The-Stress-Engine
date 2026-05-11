import * as crypto from 'crypto';

export interface EncryptedData {
    content: string;
    iv: string;
    authTag: string;
}

export class CryptoEngine {
    private static ALGORITHM = 'aes-256-gcm';

    static encrypt(data: any, keyHex: string): EncryptedData {
        const iv = crypto.randomBytes(12);
        const key = Buffer.from(keyHex, 'hex');
        const cipher = crypto.createCipheriv(this.ALGORITHM, key, iv) as crypto.CipherGCM;
        
        let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
        encrypted += cipher.final('hex');
        
        const authTag = cipher.getAuthTag().toString('hex');

        return {
            content: encrypted,
            iv: iv.toString('hex'),
            authTag: authTag
        };
    }

    static decrypt(encryptedData: EncryptedData, keyHex: string): any {
        try {
            const key = Buffer.from(keyHex, 'hex');
            const iv = Buffer.from(encryptedData.iv, 'hex');
            const authTag = Buffer.from(encryptedData.authTag, 'hex');
            const decipher = crypto.createDecipheriv(this.ALGORITHM, key, iv) as crypto.DecipherGCM;
            
            decipher.setAuthTag(authTag);
            
            let decrypted = decipher.update(encryptedData.content, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            
            return JSON.parse(decrypted);
        } catch (error) {
            throw new Error('BAD_DECRYPT_OR_TAMPERED');
        }
    }
}
