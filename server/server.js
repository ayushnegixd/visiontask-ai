const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const screenshotRoutes = require('./routes/screenshotRoutes');
const userRoutes = require('./routes/userRoutes');

connectDB();

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

app.use('/api/screenshots', screenshotRoutes);
app.use('/api/screenshots', screenshotRoutes);
app.use('/api/users', userRoutes);

const uploadsPath = path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadsPath));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`\n  🚀 Server ready at: http://localhost:${PORT}/\n`);
});