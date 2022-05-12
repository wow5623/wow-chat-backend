global.crypto = require('crypto');

class CryptoManager {
  async generateKeyPair() {
    const keyPair = await crypto.subtle.generateKey(
      {
        name: 'ECDH',
        namedCurve: 'P-256',
      },
      true,
      ['deriveKey', 'deriveBits'],
    );

    const publicKeyJwk = await crypto.subtle.exportKey(
      'jwk',
      keyPair.publicKey,
    );

    const privateKeyJwk = await crypto.subtle.exportKey(
      'jwk',
      keyPair.privateKey,
    );

    const publicKeyRaw = await crypto.subtle.exportKey(
      'raw',
      keyPair.publicKey,
    );

    const privateKeyRaw = await crypto.subtle.exportKey(
      'raw',
      keyPair.privateKey,
    );

    console.log(publicKeyRaw, privateKeyRaw);

    return { publicKeyJwk, privateKeyJwk };
  }

  async generateDeriveKey(publicKeyJwk, privateKeyJwk) {
    const publicKey = await crypto.subtle.importKey(
      'jwk',
      publicKeyJwk,
      {
        name: 'ECDH',
        namedCurve: 'P-256',
      },
      true,
      [],
    );

    const privateKey = await crypto.subtle.importKey(
      'jwk',
      privateKeyJwk,
      {
        name: 'ECDH',
        namedCurve: 'P-256',
      },
      true,
      ['deriveKey', 'deriveBits'],
    );

    return await crypto.subtle.deriveKey(
      { name: 'ECDH', public: publicKey },
      privateKey,
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt'],
    );
  }

  async encryptText(text, derivedKey) {
    const encodedText = new TextEncoder().encode(text);

    console.group('ШИФРОВАНИЕ');

    console.log('encodedText', encodedText);
    console.log('derivedKey', derivedKey);

    const encryptedData = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: new TextEncoder().encode('Initialization Vector'),
      },
      derivedKey,
      encodedText,
    );

    console.log('encryptedData', encryptedData);

    const uintArray = new Uint8Array(encryptedData);

    console.log('uintArray', encryptedData);

    const string = String.fromCharCode.apply(null, uintArray);

    console.log('string from char code', encryptedData);

    const result = btoa(string);

    console.log('result btoa', result);

    console.groupEnd();

    return result;
  }

  async decryptText(text, derivedKey) {
    try {
      /* const message = JSON.parse(messageJSON);
       const text = message.base64Data;
       const initializationVector = new Uint8Array(message.initializationVector).buffer;*/

      const string = atob(text);
      const uintArray = new Uint8Array(
        [...string.split('')].map((char) => char.charCodeAt(0)),
      );
      const algorithm = {
        name: 'AES-GCM',
        iv: new TextEncoder().encode('Initialization Vector'),
      };
      const decryptedData = await crypto.subtle.decrypt(
        algorithm,
        derivedKey,
        uintArray,
      );

      return new TextDecoder().decode(decryptedData);
    } catch (e) {
      return `error decrypting message: ${e}`;
    }
  }
}

const generateKeys = async () => {
  const text = 'Привет, я волк ^-^';

  const crypto = new CryptoManager();
  const keys1 = await crypto.generateKeyPair();
  const keys2 = await crypto.generateKeyPair();

  const derivedKey = await crypto.generateDeriveKey(
    keys2.publicKeyJwk,
    keys1.privateKeyJwk,
  );

  const encryptedText = await crypto.encryptText(text, derivedKey);

  await generateKeys2(keys2, keys1.publicKeyJwk, encryptedText);

  console.group('User-1 keys');
  console.log('JWK keys', keys1);
  console.log('Derive key', derivedKey);
  console.log('encryptedText', encryptedText);
  console.groupEnd();
};

const generateKeys2 = async (keys2, pubKey1, encryptedText) => {
  const crypto = new CryptoManager();

  const derivedKey = await crypto.generateDeriveKey(
    pubKey1,
    keys2.privateKeyJwk,
  );

  const decryptedText = await crypto.decryptText(encryptedText, derivedKey);

  console.group('User-2 keys');
  console.log('JWK keys', keys2);
  console.log('Derive key', derivedKey);
  console.log('encryptedText', encryptedText);
  console.log('decryptedText', decryptedText);
  console.groupEnd();
};

generateKeys();
