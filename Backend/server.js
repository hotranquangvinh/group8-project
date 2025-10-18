// server.js
const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config(); // đọc file .env
connectDB(); // kết nối MongoDB

const app = express();
app.use(express.json()); // cho phép parse JSON từ body

// Import routes
const userRoutes = require('./routes/user');
app.use('/api', userRoutes); // prefix cho API

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
