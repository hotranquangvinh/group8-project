const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// 🧩 Load biến môi trường từ Backend/.env
dotenv.config({ path: path.join(__dirname, '.env') });

// 🧱 Kết nối MongoDB
connectDB();

const app = express();

// ⚙️ Middleware chung
app.use(cors());
app.use(express.json());

// 🧭 Định tuyến API
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/user')); // chứa route Admin + User
app.use('/api/profile', require('./routes/profileRoutes'));
<<<<<<< HEAD
=======
app.use('/api/advanced', require('./routes/advancedRoutes')); // <-- thêm route Advanced
>>>>>>> backend-forgot-password

// 🧩 Trang kiểm tra nhanh server (tuỳ chọn)
app.get('/', (req, res) => {
  res.send('✅ API Server is running...');
});

// ⚡ Khởi động server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
