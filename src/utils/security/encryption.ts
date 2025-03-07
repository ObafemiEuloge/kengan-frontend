import SecureLS from 'secure-ls';
import CryptoJS from 'crypto-js';

// Initialisation du stockage sécurisé
const encryptStorage = new SecureLS({
  encodingType: 'aes',
  isCompression: true,
  encryptionSecret: import.meta.env.VITE_ENCRYPTION_KEY || 'kengan-secure-key'
});

// Fonction pour chiffrer une chaîne
const encrypt = (text: string, key = import.meta.env.VITE_ENCRYPTION_KEY): string => {
  return CryptoJS.AES.encrypt(text, key || 'kengan-secure-key').toString();
};

// Fonction pour déchiffrer une chaîne
const decrypt = (ciphertext: string, key = import.meta.env.VITE_ENCRYPTION_KEY): string => {
  const bytes = CryptoJS.AES.decrypt(ciphertext, key || 'kengan-secure-key');
  return bytes.toString(CryptoJS.enc.Utf8);
};

// Fonction pour hacher une chaîne (non réversible)
const hash = (text: string): string => {
  return CryptoJS.SHA256(text).toString();
};

export { encryptStorage, encrypt, decrypt, hash };