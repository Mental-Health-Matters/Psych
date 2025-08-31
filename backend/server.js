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

const PORT = process.env.PORT || 3000;


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
    'https://psych-xi.vercel.app',    
    'http://localhost:5173'           
  ],
  credentials: true
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
