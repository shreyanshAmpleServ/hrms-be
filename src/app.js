const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const routes = require('../src/routes/');
const responseHandler = require('../src/utils/responseMiddleware');
const errorHandler = require('../src/utils/errorMiddleware');
const cookieParser = require('cookie-parser');

// const isProduction = process.env.NODE_ENV === 'production';

dotenv.config();

const app = express();


// Middleware for parsing JSON and URL-encoded data
app.use(express.json());

app.use(express.urlencoded({ extended: true })); // Support URL-encoded bodies
app.use(cookieParser());
app.use(cors({
    origin:  ["http://192.168.29.89:3000" ,'http://localhost:3000',"http://10.160.5.101:3000"] ,// Replace with your frontend URL
    credentials: true, // Allow cookies to be sent
}));

app.use(responseHandler);
app.use('/uploads', express.static('uploads'));
app.use('/api', routes);

app.use(errorHandler);

module.exports = app;
