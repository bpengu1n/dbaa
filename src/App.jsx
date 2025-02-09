import React, { useState } from 'react';
import CryptoJS from 'crypto-js';

const App = () => {
  const [selectedInput, setSelectedInput] = useState(''); // Dropdown input selection
  const [customInput, setCustomInput] = useState(''); // Custom input text field
  const [decryptionKey, setDecryptionKey] = useState('');
  const [encryptedText, setEncryptedText] = useState('');
  const [decryptedText, setDecryptedText] = useState('');
  const [successfulKey, setSuccessfulKey] = useState('');

  const exampleInputs = [
    'he/him',
    'she/her',
    'they/them',
    'xe/xem',
    'ze/zir',
    'fae/faer',
    'any/all',
  ];

  // Weak key derivation for high-collision likelihood
  const deriveWeakKey = (input) => {
    const hash = CryptoJS.SHA256(input).toString(CryptoJS.enc.Hex); // Hash and truncate
    return CryptoJS.enc.Hex.parse(hash.substring(0, 16)); // Return 2-byte key
  };

  const encryptMessage = () => {
    const input = customInput || selectedInput;
    if (!input) {
      alert('Please select or enter an input to encrypt.');
      return;
    }

    const key = deriveWeakKey(input);
    const iv = CryptoJS.lib.WordArray.random(8); // Small IV for collisions
    const messageToEncrypt = "Don't be an assole"

    // Encrypt the input using AES
    const encrypted = CryptoJS.AES.encrypt(messageToEncrypt, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    const encryptedData = iv.concat(encrypted.ciphertext).toString(CryptoJS.enc.Base64);
    setEncryptedText(encryptedData);
  };

  const decryptMessage = () => {
    if (!encryptedText) {
      alert('Please provide base64-encoded text to decrypt.');
      return;
    }

    try {
      const encryptedData = CryptoJS.enc.Base64.parse(encryptedText);
      const iv = CryptoJS.lib.WordArray.create(encryptedData.words.slice(0, 2)); // Extract IV
      const ciphertext = CryptoJS.lib.WordArray.create(encryptedData.words.slice(2));

      let keysToTry = decryptionKey ? [decryptionKey] : exampleInputs;
      let foundKey = '';
      let decryptedOutput = '';

      for (let key of keysToTry) {
        const derivedKey = deriveWeakKey(key);

        const decrypted = CryptoJS.AES.decrypt(
          { ciphertext: ciphertext },
          derivedKey,
          { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }
        );
        try {
          const decryptedTextOutput = decrypted.toString(CryptoJS.enc.Utf8);
          if (decryptedTextOutput) {
            foundKey = key;
            decryptedOutput = decryptedTextOutput;
            break;
          }
        } catch (error) {
          console.log(error);
        }
        
      }

      if (decryptedOutput) {
        setDecryptedText(decryptedOutput);
        setSuccessfulKey(foundKey);
      } else {
        alert('Decryption failed with the provided options.');
      }
    } catch (error) {
      alert('Decryption failed: Invalid input or keys.');
    }
  };

  return (
    <div style={{ backgroundColor: '#121212', color: '#ffffff', minHeight: '100vh', padding: '20px' }}>
      <h1>Refutable Message Sharing Tool</h1>
      <p>Use this tool to encrypt and share short messages. The chosen key gives you the option to communicate some short 1-2 word attribute (sometimes delimited by a slash) that you may not be able to communicate in plaintext, but would like other like-minded individuals to know. Please note that the encryption is very insecure, as key input checksums are truncated down to the first eight bytes. While none of the pre-provided keys collide, there will be PLENTY of opportunities for collision. Select from completely unrelated example inputs or enter your own custom input.</p>

      {/* Encryption Section */}
      <h2>Encrypt a Message</h2>
      <p>Select an example input or specify your own:</p>

      <select
        value={selectedInput}
        onChange={(e) => setSelectedInput(e.target.value)}
        style={{
          padding: '10px',
          fontSize: '16px',
          width: '300px',
          marginBottom: '10px',
        }}
      >
        <option value="">-- Select an Example Input --</option>
        {exampleInputs.map((input) => (
          <option key={input} value={input}>
            {input}
          </option>
        ))}
      </select>
      <br />

      <p>Or enter your own custom input:</p>
      <input
        type="text"
        value={customInput}
        onChange={(e) => setCustomInput(e.target.value)}
        placeholder="Enter custom input"
        style={{
          padding: '10px',
          fontSize: '16px',
          width: '300px',
          marginBottom: '10px',
        }}
      />
      <br />

      <button
        onClick={encryptMessage}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          cursor: 'pointer',
          backgroundColor: '#333',
          color: '#fff',
          border: 'none',
        }}
      >
        Encrypt Input
      </button>

      {encryptedText && (
        <div style={{ marginTop: '20px', wordWrap: 'break-word' }}>
          <h3>Encrypted Output (Base64):</h3>
          <p>{encryptedText}</p>
        </div>
      )}

      <hr style={{ margin: '30px 0', borderColor: '#444' }} />

      {/* Decryption Section */}
      <h2>Decrypt a Message</h2>
      <p>Enter a decryption key or leave it blank to try common options:</p>
      <input
        type="text"
        value={decryptionKey}
        onChange={(e) => setDecryptionKey(e.target.value)}
        placeholder="Enter decryption key (optional)"
        style={{
          padding: '10px',
          fontSize: '16px',
          width: '300px',
          marginBottom: '10px',
        }}
      />
      <br />
      <textarea
        rows="3"
        value={encryptedText}
        onChange={(e) => setEncryptedText(e.target.value)}
        placeholder="Paste base64-encoded encrypted text"
        style={{
          padding: '10px',
          fontSize: '16px',
          width: '300px',
          marginBottom: '10px',
        }}
      />
      <br />
      <button
        onClick={decryptMessage}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          cursor: 'pointer',
          backgroundColor: '#333',
          color: '#fff',
          border: 'none',
        }}
      >
        Decrypt Input
      </button>

      {decryptedText && (
        <div style={{ marginTop: '20px', wordWrap: 'break-word' }}>
          <h3>Decrypted Message:</h3>
          <p>{decryptedText}</p>
          <h3>Key Used:</h3>
          <p>{successfulKey}</p>
        </div>
      )}
    </div>
  );
};

export default App;
