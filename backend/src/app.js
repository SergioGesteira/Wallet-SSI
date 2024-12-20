// app.js
import express from 'express';
import session from 'express-session';
import cors from 'cors';
import bodyParser from 'body-parser';
import passport from './config/passportConfig.js';
import corsOptions from './config/corsConfig.js';
import dbConnection from './config/dbConfig.js';
import authRoutes from './routes/authRoutes.js';

const app = express();

app.use(cors(corsOptions));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret: process.env.SESSION_SECRET || 'default_secret', resave: false, saveUninitialized: true }));

dbConnection.initialize().then(() => console.log('Data Source initialized'));

app.use(passport.initialize());
app.use('/', authRoutes);

export default app;
