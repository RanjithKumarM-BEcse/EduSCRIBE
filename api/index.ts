import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes.js';
import roomsRoutes from './routes/rooms.routes.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Mount routes. Vercel sometimes strips the /api prefix depending on the rewrite rule.
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);

app.use('/api/rooms', roomsRoutes);
app.use('/rooms', roomsRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running!' });
});
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running!' });
});

if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;
