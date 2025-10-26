const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load environment variables from Backend/.env
dotenv.config({ path: path.join(__dirname, '.env') });
connectDB();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/user'));
app.use('/api/profile', require('./routes/profileRoutes'));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));