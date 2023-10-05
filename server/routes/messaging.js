const router = require('express').Router();
const { v4: uuidv4 } = require('uuid');
require("dotenv").config()
const sendMessage = require("../send_message.js")
const { addMessage, getChatMessages } = require("../messages/chat_messages.js")

router.post("/send", async (req, res) => {
    try {
        const { userMessage, userId, sessionId = uuidv4(), nickname } = req.body

        addMessage(userId, userMessage, "user")

        const api_key = process.env.api_key
        const system_message = process.env.system_message + ` ${nickname}.`

        const response = await sendMessage(userMessage, userId, sessionId, api_key, system_message)
        
        if (Array.isArray(response)) {
            for (let i = 0; i < response.length; i++) {
                addMessage(userId, response[i], "relly")
            }
        } else {
            addMessage(userId, response, "relly")
        }


        res.json(response)
    } catch (error) {
        console.log(error);
        res.status(500).send('Server error');
    }
})

router.post("/get_messages", async (req, res) => {
    try {
        const { userId } = req.body
        
        response = await getChatMessages(userId)

        res.json(response)
    } catch (error) {
        console.log(error);
        res.status(500).send('Server error');
    }


})

module.exports = router