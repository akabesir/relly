const express = require('express');
const app = express();
const cors = require('cors');
require("dotenv").config();

//middleware
app.use(express.json()); //res.body
app.use(cors());

//messaging route
app.use('/message', require('./routes/messaging'));

//server listening for requests
app.listen(process.env.server_port || 5000, ()=> {
    console.log('server is running on port 5000');
})

