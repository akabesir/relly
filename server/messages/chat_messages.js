const { db } = require('../firebase.js'); // Update with your config file path
const { encryptMessage, decryptMessage } = require("../utils/utils.js")
const admin = require('firebase-admin');

const addMessage = async(user_id, message, role) => {
    try {
        // Get a reference to the user's chat document
        const userChatRef = db.collection('chat_messages').where('user_id', '==', user_id);

        // Query Firestore for the user's document ID
        const snapshot = await userChatRef.get();

        // Get encryption password
        const password = process.env.SECRET_KEY;

        const message_object = { role: role, content: message, timestamp: new Date().toISOString() };
        const encryptedMessage = encryptMessage(message_object, password);

        // Ensure a document with the specified user_id exists
        if (!snapshot.empty) {
            const doc = snapshot.docs[0];


            // Add the new message to the messages array in the user's chat document
            await doc.ref.update({
                messages: admin.firestore.FieldValue.arrayUnion(encryptedMessage)
            });

            console.log('Message added to chat');
        } else {
            console.log('No chat document found');
            
            // Create a new chat document for the user_id
            await db.collection('chat_messages').add({
                user_id: user_id,
                messages: [encryptedMessage]
            });

            console.log('New chat document created');
        }
    } catch (error) {
        // Log and re-throw errors
        console.error('Error adding message:', error);
        throw error;
    }
}

/**
 * Fetch chat messages for a specific user
 * @param {string} userId - The ID of the user to fetch chat messages for
 * @returns {Promise<Array<Object>>} - A promise that resolves with the fetched chat messages
 */
const getChatMessages = async(userId) => {
    try {
        // Create a query against the collection
        const query = db.collection('chat_messages').where('user_id', '==', userId);
        
        // Execute the query
        const querySnapshot = await query.get();

        // Create an array to hold the fetched chat messages
        const chatMessagesDoc = [];

        // Loop through the results and add them to the array
        querySnapshot.forEach(doc => {
            chatMessagesDoc.push({
                id: doc.id,
                ...doc.data()
            });
        });
        // Log and return the fetched chat messages

        // Decryption password
        const password = process.env.SECRET_KEY

        const chatMessages = chatMessagesDoc[0]
        const chatMessagesDecrypted = chatMessages.messages.map((message) => {
            const { role, content, timestamp} = decryptMessage(message, password)

            return { role, content, timestamp }
        })  
        return chatMessagesDecrypted;
    } catch (error) {
        // Log and re-throw errors
        console.error('Error fetching chat messages:', error);
        throw error;
    }
}

module.exports = { addMessage, getChatMessages }