import express from 'express';
import authRoutes from './routes/auth.routes.js';
import memberRoutes from './routes/members.js';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/members', memberRoutes);

// Add a root route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Growlio Backend API' });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));