# 🔑 Frontend Forgot Password & Reset Password - Sinh Viên 2

## 🎯 Mục tiêu
Tạo giao diện cho user quên mật khẩu, nhận email có token, và reset password mới.

---

## ✅ Đã hoàn thành

### 1. **Component ForgotPassword.jsx** 
📍 **Vị trí:** `frontend/src/ForgotPassword.jsx`

**Tính năng:**
- ✅ Form nhập email
- ✅ Gửi request đến `/api/auth/forgot-password`
- ✅ Hiển thị thông báo thành công/lỗi
- ✅ UI đẹp với gradient background
- ✅ Validation email

**Flow:**
```
User nhập email → Click "Gửi email" → 
Backend gửi email chứa token → 
User nhận email → Click link reset password
```

**Code chính:**
```jsx
import axiosInstance from './axiosConfig';

const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Validation
  if (!email.trim()) {
    setMessage({ type: 'error', text: '❌ Vui lòng nhập email' });
    return;
  }

  setLoading(true);
  try {
    // Gửi request forgot password
    const res = await axiosInstance.post('/auth/forgot-password', { 
      email: email.trim() 
    });
    
    setMessage({ 
      type: 'success', 
      text: '✅ ' + (res.data?.message || 'Email đã được gửi! Kiểm tra hộp thư.') 
    });
  } catch (err) {
    const errMsg = err.response?.data?.message || err.message;
    setMessage({ type: 'error', text: `❌ Lỗi: ${errMsg}` });
  } finally {
    setLoading(false);
  }
};
```

---

### 2. **Component ResetPassword.jsx**
📍 **Vị trí:** `frontend/src/ResetPassword.jsx`

**Tính năng:**
- ✅ Form nhập password mới
- ✅ Parse token từ URL `/reset-password/:token`
- ✅ Gửi request đến `/api/auth/reset-password/:token`
- ✅ Hiển thị thông báo thành công
- ✅ Redirect về Login sau 3 giây
- ✅ UI đẹp với gradient background

**Flow:**
```
User click link trong email → 
URL: /reset-password/abc123token → 
Nhập password mới → Submit → 
Backend reset password → 
Redirect về Login
```

**Code chính:**
```jsx
import axiosInstance from './axiosConfig';

// Parse token từ URL
const token = window.location.pathname.split('/reset-password/')[1];

const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Validation
  if (!newPassword.trim()) {
    setMessage({ type: 'error', text: '❌ Vui lòng nhập mật khẩu mới' });
    return;
  }

  setLoading(true);
  try {
    // Gửi request reset password
    const res = await axiosInstance.post(`/auth/reset-password/${token}`, { 
      newPassword 
    });
    
    setMessage({ 
      type: 'success', 
      text: '✅ ' + (res.data?.message || 'Đổi mật khẩu thành công!') 
    });
    
    // Redirect về login sau 3 giây
    setTimeout(() => {
      window.location.href = '/';
    }, 3000);
  } catch (err) {
    const errMsg = err.response?.data?.message || err.message;
    setMessage({ type: 'error', text: `❌ ${errMsg}` });
  } finally {
    setLoading(false);
  }
};
```

---

### 3. **Cập nhật Login.jsx**
Thêm link "🔑 Quên mật khẩu?" ở dưới form login:

```jsx
<div style={{ marginTop: 16, textAlign: 'center' }}>
  <a href="#forgot-password" style={{ 
    color: '#1976d2', 
    textDecoration: 'none', 
    fontSize: 14 
  }}>
    🔑 Quên mật khẩu?
  </a>
</div>
```

---

### 4. **Routing trong App.js**

```jsx
// Kiểm tra URL có phải /reset-password/:token không
{window.location.pathname.startsWith('/reset-password/') ? (
  <ResetPassword />
) : view === 'forgot' ? (
  <ForgotPassword />
) : (
  <Login onLogin={handleLogin} />
)}

// Button chuyển sang ForgotPassword
<button onClick={() => setView('forgot')}>
  Quên mật khẩu
</button>
```

---

## 🔄 Flow hoàn chỉnh

### **Bước 1: User quên mật khẩu**
1. Click "🔑 Quên mật khẩu?" trong Login
2. Hoặc click button "Quên mật khẩu" ở menu
3. Chuyển sang view `ForgotPassword`

### **Bước 2: Nhập email**
1. User nhập email đã đăng ký
2. Click "📧 Gửi email"
3. Frontend gọi API: `POST /api/auth/forgot-password`

### **Bước 3: Backend xử lý**
(Đây là công việc của SV1 và SV3)
```
Backend nhận email → 
Tìm user trong DB → 
Tạo reset token (JWT hoặc random string) → 
Gửi email qua Nodemailer (Gmail SMTP) → 
Email chứa link: http://localhost:3001/reset-password/{token}
```

### **Bước 4: User nhận email**
1. Mở email (Gmail, Outlook, etc.)
2. Click link reset password
3. Browser mở URL: `/reset-password/abc123token`

### **Bước 5: Reset password**
1. ResetPassword component render
2. Parse token từ URL
3. User nhập password mới
4. Click "🔑 Đổi mật khẩu"
5. Frontend gọi API: `POST /api/auth/reset-password/:token`

### **Bước 6: Thành công**
1. Backend kiểm tra token hợp lệ
2. Cập nhật password mới (bcrypt hash)
3. Trả về success message
4. Frontend hiển thị "✅ Đổi mật khẩu thành công!"
5. Auto redirect về Login sau 3 giây
6. User login với password mới

---

## 🧪 Cách Test

### **Điều kiện tiên quyết:**
1. ✅ Backend đang chạy (`node server.js`)
2. ✅ MongoDB đang chạy
3. ✅ Gmail SMTP đã config (SV3 phải làm)
4. ✅ File `.env` có:
```
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### **Test Flow:**

#### **Test 1: Forgot Password**
```bash
cd frontend
npm start
```

1. Mở http://localhost:3001
2. Click "🔑 Quên mật khẩu?"
3. Nhập email: `test@example.com`
4. Click "📧 Gửi email"
5. ✅ Thấy message: "Email đã được gửi!"

#### **Test 2: Check Email**
1. Mở Gmail (email đã nhập)
2. Tìm email từ hệ thống
3. Subject: "Reset Password"
4. Body: Link dạng `http://localhost:3001/reset-password/abc123...`
5. Click link

#### **Test 3: Reset Password**
1. Browser mở `/reset-password/:token`
2. Nhập password mới: `newPassword123`
3. Click "🔑 Đổi mật khẩu"
4. ✅ Thấy: "Đổi mật khẩu thành công!"
5. ⏰ Đợi 3 giây → Auto redirect về Login
6. Login với password mới
7. ✅ Đăng nhập thành công!

---

## 📸 Demo Screenshot cần chụp

### 1. **Form Forgot Password**
- Màn hình nhập email
- Thông báo "Email đã được gửi!"

### 2. **Email nhận được**
- Screenshot email trong Gmail
- Highlight link reset password
- Subject và nội dung email

### 3. **Form Reset Password**
- Màn hình nhập password mới
- URL bar hiển thị `/reset-password/:token`

### 4. **Thành công**
- Message "Đổi mật khẩu thành công!"
- Countdown 3 giây

### 5. **Login với password mới**
- Đăng nhập thành công
- Hiển thị Profile

---

## 🎨 UI/UX Design

### **Colors:**
- Primary: `#2196F3` (Blue)
- Success: `#4CAF50` (Green) 
- Error: `#f44336` (Red)
- Gradient: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`

### **Layout:**
```
┌─────────────────────────────────┐
│   🔑 Forgot Password Form       │
│                                 │
│   📧 Email Input                │
│   [text input]                  │
│                                 │
│   [📧 Gửi email] button         │
│                                 │
│   ✅ Success/Error Message      │
└─────────────────────────────────┘
```

---

## 🐛 Troubleshooting

### Lỗi: "Email không tồn tại"
**Nguyên nhân:** Email chưa đăng ký trong hệ thống  
**Giải pháp:** Đăng ký account trước, hoặc dùng email đã có

### Lỗi: "Token không hợp lệ"
**Nguyên nhân:** Token đã hết hạn hoặc không đúng  
**Giải pháp:** Request forgot password lại để nhận token mới

### Lỗi: "Không nhận được email"
**Nguyên nhân:** 
- Gmail SMTP chưa config đúng (SV3)
- Email bị vào Spam
- App password Gmail sai

**Giải pháp:**
1. Check spam folder
2. Verify `.env` có EMAIL_USER và EMAIL_PASS
3. Test Gmail SMTP với SV3

### Lỗi: "Cannot POST /api/auth/forgot-password"
**Nguyên nhân:** Backend chưa có route  
**Giải pháp:** SV1 phải thêm routes trong `authRoutes.js`:
```js
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password/:token', authController.resetPassword);
```

---

## 📝 Git Workflow - Sinh viên 2

### **Tạo branch:**
```bash
git checkout -b feature/forgot-password
```

### **Add files:**
```bash
git add frontend/src/ForgotPassword.jsx
git add frontend/src/ResetPassword.jsx
git add frontend/src/Login.jsx
git add frontend/src/App.js
git add frontend/FORGOT_PASSWORD_FRONTEND.md
```

### **Commit:**
```bash
git commit -m "Frontend: Thêm chức năng quên mật khẩu

- Tạo component ForgotPassword để nhập email
- Tạo component ResetPassword để đổi password
- Thêm link 'Quên mật khẩu' trong Login
- Cập nhật routing trong App.js
- UI gradient đẹp với validation
- Auto redirect sau reset thành công
- Console logging để debug"
```

### **Push:**
```bash
git push origin feature/forgot-password
```

### **Tạo Pull Request:**
1. Vào GitHub repository
2. Click "Pull requests" → "New pull request"
3. Base: `main` ← Compare: `feature/forgot-password`
4. Title: **"Frontend: Forgot Password & Reset Password"**
5. Description:
```markdown
## 🎯 Tính năng
- Form quên mật khẩu (nhập email)
- Form reset password (nhập password mới)
- Parse token từ URL
- Auto redirect sau thành công

## 📸 Screenshot
[Thêm ảnh: Form Forgot Password]
[Thêm ảnh: Email nhận token]
[Thêm ảnh: Form Reset Password]
[Thêm ảnh: Login thành công]

## 🧪 Test
- ✅ Gửi email thành công
- ✅ Nhận email với token
- ✅ Reset password thành công
- ✅ Login với password mới

## 👥 Team
- **SV1:** Backend API (forgot-password, reset-password)
- **SV2:** Frontend (ForgotPassword.jsx, ResetPassword.jsx) ← YOU
- **SV3:** Gmail SMTP config (Nodemailer)

## 📚 Docs
- Backend API: `/api/auth/forgot-password`
- Backend API: `/api/auth/reset-password/:token`
- Frontend doc: `FORGOT_PASSWORD_FRONTEND.md`
```

---

## 📚 Dependencies

```json
{
  "axios": "^1.12.2",
  "react": "^19.2.0"
}
```

**Không cần cài thêm package nào!** ✅

---

## 🎓 Kiến thức Frontend cần nắm

1. **URL Parsing**
   - `window.location.pathname`
   - `.split()` để tách token từ URL

2. **Form Handling**
   - `useState` cho input fields
   - `handleSubmit` với `e.preventDefault()`

3. **API Calls**
   - `axiosInstance.post()` với baseURL
   - Error handling với try/catch

4. **Routing**
   - Conditional rendering dựa vào URL
   - `window.location.pathname.startsWith()`

5. **Auto Redirect**
   - `setTimeout()` + `window.location.href`

6. **Validation**
   - Check email không rỗng
   - Check password không rỗng

---

## 🔗 API Endpoints (Backend - SV1)

### **POST /api/auth/forgot-password**
**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response (200):**
```json
{
  "message": "Email reset password đã được gửi"
}
```

**Response (404):**
```json
{
  "message": "Email không tồn tại"
}
```

---

### **POST /api/auth/reset-password/:token**
**Request:**
```json
{
  "newPassword": "newPassword123"
}
```

**Response (200):**
```json
{
  "message": "Đổi mật khẩu thành công"
}
```

**Response (400):**
```json
{
  "message": "Token không hợp lệ hoặc đã hết hạn"
}
```

---

## ✨ Điểm cộng

- ✅ UI/UX đẹp, chuyên nghiệp
- ✅ Gradient background
- ✅ Validation đầy đủ
- ✅ Error handling tốt
- ✅ Auto redirect thông minh
- ✅ Console logging để debug
- ✅ Responsive design
- ✅ Code clean, dễ đọc

---

## 📞 Phân công Team

| Thành viên | Công việc | Trạng thái |
|------------|-----------|------------|
| **SV1** | Backend API `/auth/forgot-password` | ⏳ Chờ |
| **SV1** | Backend API `/auth/reset-password/:token` | ⏳ Chờ |
| **SV2** | Frontend `ForgotPassword.jsx` | ✅ Hoàn thành |
| **SV2** | Frontend `ResetPassword.jsx` | ✅ Hoàn thành |
| **SV2** | Update `Login.jsx`, `App.js` | ✅ Hoàn thành |
| **SV3** | Config Nodemailer + Gmail SMTP | ⏳ Chờ |
| **SV3** | Test gửi email thật | ⏳ Chờ |

---

## 🚀 Next Steps

### **Ngay bây giờ:**
1. Đọc document này
2. Test frontend (mock API nếu backend chưa xong)
3. Chụp screenshot UI
4. Tạo Git branch và commit

### **Khi SV1 + SV3 xong:**
1. Test flow hoàn chỉnh
2. Nhận email thật
3. Reset password thật
4. Chụp screenshot email
5. Tạo Pull Request

---

**Người thực hiện:** Sinh viên 2 - Frontend  
**Ngày:** 31/10/2025  
**Status:** ✅ Hoàn thành Frontend
