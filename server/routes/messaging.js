const router = require('express').Router();
const { v4: uuidv4 } = require('uuid');
require("dotenv").config()
const sendMessage = require("../send_message.js")

router.post("/send", async (req, res) => {
    try {
        const { userMessage, userId, sessionId = uuidv4(), nickname } = req.body

        const api_key = process.env.api_key
        const system_message = process.env.system_message + ` ${nickname}.`

        const response = await sendMessage(userMessage, userId, sessionId, api_key, system_message)
        
        res.json(response)
    } catch (error) {
        console.log(error);
        res.status(500).send('Server error');
    }
})

module.exports = router