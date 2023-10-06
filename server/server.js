const express = require('express');
const app = express();
const cors = require('cors');
require("dotenv").config();

//middleware
app.use(express.json()); //res.body
app.use(cors({
    origin: 'https://rellyv2.vercel.app/', // specify the allowed origin
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // specify allowed methods
    credentials: true, // enable credentials (cookies, authorization headers, etc.)
  }));

//messaging route
app.use('/message', require('./routes/messaging'));

//server listening for requests
app.listen(process.env.server_port || 5000, ()=> {
    console.log('server is running');
})

