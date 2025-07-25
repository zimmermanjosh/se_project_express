const express = require("express");
const { errors } = require('celebrate');
const mongoose = require("mongoose");
const cors = require("cors");
const { requestLogger, errorLogger } = require('./middlewares/logger');
const errorHandler = require('./middlewares/errorHandler');
require('dotenv').config();
const {DOMAIN_URL} = require('./utils/config');

mongoose.set('strictQuery', false);

const routes = require("./routes"); // This imports the centralized routes
const { login, createUser } = require("./controllers/users");
const { validateAuth, validateUserBody } = require("./middlewares/validator");

const app = express();
const { PORT = 3001, BASE_PATH = "http://localhost" } = process.env;

mongoose
    .connect("mongodb://127.0.0.1:27017/wtwr_db")
    .then(() => {
        console.log("Connected to MongoDB");
    })
    .catch((err) => console.error(err));

app.use(express.json());
app.use(cors({
    origin: [
        'https://testwtwr.jumpingcrab.com',      // Original domain
        'https://www.testwtwr.jumpingcrab.com',  // With www subdomain
        'http://localhost:3000'                  // Development
    ],
    credentials: true
}));

// Place requestLogger BEFORE all routes
app.use(requestLogger);

app.get('/crash-test', () => {
    setTimeout(() => {
        throw new Error('Server will crash now');
    }, 0);
});

app.post("/signin", validateAuth, login);
app.post("/signup", validateUserBody, createUser);

// Use centralized routes instead of individual route files
app.use(routes);

app.use(errorLogger);
app.use(errors()); // Celebrate error handler
app.use(errorHandler); // Your custom error handler (MUST be last!)

app.listen(PORT, () => {
    console.log(`Server running on ${BASE_PATH}:${PORT}`);
});