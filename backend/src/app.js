// app.js
import express from 'express';
import session from 'express-session';
import bodyParser from 'body-parser';
import passport from './config/passportConfig.js';
import corsOptions from './config/corsConfig.js';
import dbConnection from './config/dbConfig.js';
import authRoutes from './routes/authRoutes.js';
import universityRoutes from './routes/universityRoutes.js'; 
import cors from 'cors';


const allowedOrigins = ['http://localhost:3000', 'http://127.0.0.1:3000'];

const app = express();
app.use(cors(corsOptions));
app.use(cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  }));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret: process.env.SESSION_SECRET || 'default_secret', resave: false, saveUninitialized: true }));

dbConnection.initialize().then(() => console.log('Data Source initialized'));

app.use(passport.initialize());
app.use('/', authRoutes);
app.use('/university', universityRoutes);


export default app;
