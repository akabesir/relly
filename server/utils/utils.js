const crypto = require('crypto');

const algorithm = 'aes-256-cbc';

// Function to derive a key from the password using PBKDF2
function getKeyFromPassword(password, salt) {
    // Parameters: password, salt, iterations, key length, hash function
    return crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');
}

// Function to encrypt a message object with a password
function encryptMessage(message, password) {
    // Generate a new random salt
    const salt = crypto.randomBytes(16);

    // Derive a key from the password
    const key = getKeyFromPassword(password, salt);

    // Generate a new random Initialization Vector
    const iv = crypto.randomBytes(16);
    
    // Create a cipher object using the algorithm, derived key, and IV
    const cipher = crypto.createCipheriv(algorithm, key, iv);

    // Encrypt the message content and concatenate it with the final encryption block
    const encryptedContent = Buffer.concat([cipher.update(message.content, 'utf8'), cipher.final()]);

    // Replace the content in the message object with the encrypted data
    message.content = encryptedContent.toString('hex');

    // Add the IV and salt to the message object
    message.iv = iv.toString('hex');
    message.salt = salt.toString('hex');

    // Return the modified message object
    return message;
}

// Function to decrypt a message object with a password
function decryptMessage(encryptedMessage, password) {
    // Convert the salt and IV from hexadecimal strings to Buffer objects
    const salt = Buffer.from(encryptedMessage.salt, 'hex');
    const iv = Buffer.from(encryptedMessage.iv, 'hex');
    
    // Derive the key using the provided password and retrieved salt
    const key = getKeyFromPassword(password, salt);

    // Create a decipher object using the algorithm, derived key, and IV
    const decipher = crypto.createDecipheriv(algorithm, key, iv);

    // Decrypt the content and concatenate it with the final decryption block
    const decryptedContent = Buffer.concat([
        decipher.update(Buffer.from(encryptedMessage.content, 'hex')),
        decipher.final()
    ]);

    // Replace the content in the message object with the decrypted data
    encryptedMessage.content = decryptedContent.toString('utf8');

    // Remove the IV and salt from the message object, as they are not needed after decryption
    delete encryptedMessage.iv;
    delete encryptedMessage.salt;

    // Return the modified message object
    return encryptedMessage;
}


module.exports = { encryptMessage, decryptMessage }