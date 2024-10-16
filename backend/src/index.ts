import express from 'express';
import passport from 'passport';
import { json } from 'body-parser';

// Import routes
import authRoutes from './routes/auth';

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(json());
app.use(passport.initialize());

// Routes
app.use('/auth', authRoutes);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
