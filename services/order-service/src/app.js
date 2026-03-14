import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/database.js';
import orderRoutes from './routes/orderRoutes.js';
import fs from "fs";

dotenv.config();

if (process.env.NODE_ENV !== "development") {
  process.env.JWT_SECRET = fs.readFileSync("/run/secrets/JWT_SECRET", "utf8").trim();
}

const app = express();
const port = process.env.PORT || 3002;

// Connexion à la base de données seulement si pas en mode test
if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/orders', orderRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', service: 'order-service' });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Order service running on port ${port}`);
  });
}

export default app;