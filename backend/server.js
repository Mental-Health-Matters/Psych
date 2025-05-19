require('dotenv').config();
const express = require('express');
const compression = require('compression');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connect = require('./.configs/db');

const userRoutes = require('./route/user.route')
const authRoutes = require('./route/authenticate.route');
const questionnaireRoutes = require('./route/questionnaire.route')
const appointmentRoutes = require('./route/appointments.route')

const PORT = 3000;

// App
const app = express();

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(compression());

// CORS setup (do not change existing code)
app.use(cors({
    origin: [
        'http://localhost:5173', 
        'https://reimagined-spork-x55pw7957w57cp6w6-5173.app.github.dev'  // Add GitHub Codespace URL here
    ], 
    credentials: true  // Allow cookies to be sent in cross-origin requests
}));

// Routes
app.get('/', (request, response) => {
    response.send('Hello, Topper!');
});

app.use('/api/auth', authRoutes);
app.use('/api/questionnaire', questionnaireRoutes);
app.use('/api/appointments', appointmentRoutes)
app.use('/api/users', userRoutes)

app.listen(PORT, async () => {
    try {
        await connect();
        console.log(`Listening at http://localhost:${PORT}`);
    }
    catch ({ message }) {
        console.log(message);
    }
});
