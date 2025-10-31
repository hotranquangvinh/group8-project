# 📷 Frontend Upload Avatar - Sinh Viên 2

## 🎯 Mục tiêu
Tạo giao diện upload avatar, hiển thị preview và avatar sau khi upload thành công.

---

## ✅ Đã hoàn thành

### 1. **Component UploadAvatar.jsx**
📍 **Vị trí:** `frontend/src/UploadAvatar.jsx`

**Tính năng:**
- ✅ Form upload với validation (chỉ file ảnh, max 5MB)
- ✅ Preview ảnh trước khi upload
- ✅ Hiển thị avatar hiện tại của user
- ✅ Hiển thị avatar sau khi upload thành công
- ✅ UI đẹp với gradient background
- ✅ Responsive và user-friendly
- ✅ Console logging để debug

**Code chính:**
```jsx
import axiosInstance from './axiosConfig';

// Validation file
if (!f.type.startsWith('image/')) {
  setMessage({ type: 'error', text: '❌ Chỉ được upload file ảnh' });
  return;
}

if (f.size > 5 * 1024 * 1024) {
  setMessage({ type: 'error', text: '❌ File quá lớn! Tối đa 5MB' });
  return;
}

// Upload
const fd = new FormData();
fd.append('avatar', file);

const res = await axiosInstance.post('/advanced/upload-avatar', fd, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
```

---

### 2. **Cập nhật Profile.jsx**
📍 **Vị trí:** `frontend/src/Profile.jsx`

**Tính năng:**
- ✅ Hiển thị avatar tròn 150x150px với border đẹp
- ✅ Hiển thị icon placeholder nếu chưa có avatar
- ✅ Shadow effect cho avatar
- ✅ Thông báo nếu chưa có avatar

**Code hiển thị avatar:**
```jsx
{profile.avatar ? (
  <div style={{ 
    width: '150px', 
    height: '150px', 
    borderRadius: '50%',
    overflow: 'hidden',
    border: '4px solid #2196F3',
    boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)'
  }}>
    <img src={profile.avatar} alt="Avatar" />
  </div>
) : (
  <div style={{ /* gradient placeholder */ }}>
    👤
  </div>
)}
```

---

### 3. **Tích hợp vào App.js**
Avatar được hiển thị ở 2 nơi:
1. **Upload Avatar page** - Form upload riêng biệt
2. **Profile page** - Hiển thị avatar của user

---

## 🧪 Cách Test

### Bước 1: Đảm bảo backend đang chạy
```cmd
cd Backend
node server.js
```
✅ Backend phải chạy trên port 3000

### Bước 2: Đảm bảo Cloudinary đã được config
Backend phải có file `.env` với:
```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Bước 3: Chạy frontend
```cmd
cd frontend
npm start
```

### Bước 4: Test upload avatar
1. Đăng nhập vào app
2. Click "Upload Avatar" 
3. Chọn ảnh (JPG/PNG, < 5MB)
4. Xem preview
5. Click "✅ Upload"
6. Đợi upload xong
7. Avatar hiển thị trong Profile

---

## 📸 Demo Screenshot

### 1. Form Upload Avatar
- Preview ảnh trước upload
- Button upload và hủy
- Thông báo thành công/lỗi

### 2. Profile với Avatar
- Avatar tròn 150x150px
- Border xanh đẹp
- Shadow effect

### 3. Console Logging
```
📷 Avatar uploaded
Avatar URL: https://res.cloudinary.com/...
```

---

## 🔄 Workflow Upload Avatar

```
User chọn file → Validation (type & size) → 
Preview → Upload to server → 
Backend: Multer → Sharp (resize) → Cloudinary → 
Return URL → Frontend hiển thị avatar → 
Lưu vào Profile
```

---

## 📝 Git Commands (Sinh viên 2)

### Tạo branch mới
```bash
git checkout -b feature/avatar-upload
```

### Add tất cả thay đổi
```bash
git add .
```

### Commit
```bash
git commit -m "Frontend: Thêm upload avatar với Cloudinary

- Tạo component UploadAvatar với validation và preview
- Cập nhật Profile hiển thị avatar tròn
- Tích hợp axiosInstance cho upload multipart
- Thêm console logging để debug
- UI responsive và user-friendly"
```

### Push lên GitHub
```bash
git push origin feature/avatar-upload
```

### Tạo Pull Request
1. Vào GitHub repository
2. Click "Pull requests" → "New pull request"
3. Chọn branch `feature/avatar-upload`
4. Điền tiêu đề: **"Frontend: Upload Avatar với Cloudinary"**
5. Điền mô tả:
```
## Tính năng
- Upload avatar với validation
- Preview trước khi upload
- Hiển thị avatar trong Profile

## Screenshot
[Thêm ảnh demo]

## Test
- ✅ Upload ảnh thành công
- ✅ Avatar hiển thị đúng
- ✅ Validation file hoạt động
```

---

## 🎨 UI/UX Highlights

### Colors
- Primary: `#2196F3` (Blue)
- Success: `#4CAF50` (Green)
- Error: `#f44336` (Red)
- Gradient: `#667eea → #764ba2` (Purple)

### Components
- Avatar: Circle 150px với border 4px
- Preview: Circle 150px với shadow
- Buttons: Rounded 6px với hover effect
- Messages: Colored background với border

---

## 🐛 Troubleshooting

### Lỗi: "Chỉ được upload file ảnh"
✅ **Giải pháp:** Chọn file có đuôi .jpg, .png, .gif

### Lỗi: "File quá lớn"
✅ **Giải pháp:** Chọn file < 5MB

### Lỗi: "Bạn cần đăng nhập"
✅ **Giải pháp:** Đăng nhập trước khi upload

### Avatar không hiển thị
✅ **Kiểm tra:**
1. Backend có chạy không?
2. Cloudinary config đúng chưa?
3. Mở Console (F12) xem lỗi
4. Check Network tab xem response

---

## 📚 Dependencies

```json
{
  "axios": "^1.12.2",
  "react": "^19.2.0"
}
```

---

## 🎓 Kiến thức Frontend cần nắm

1. **FormData API** - Upload file
2. **FileReader / URL.createObjectURL** - Preview ảnh
3. **Axios multipart/form-data** - Gửi file lên server
4. **React State Management** - Quản lý file, preview, loading
5. **CSS in JS** - Inline styles cho component
6. **Validation** - Check file type và size

---

## ✨ Điểm cộng

- ✅ UI/UX đẹp và chuyên nghiệp
- ✅ Validation đầy đủ
- ✅ Console logging để debug
- ✅ Error handling tốt
- ✅ Responsive design
- ✅ Code clean và có comments

---

## 📞 Hỗ trợ

Nếu gặp vấn đề:
1. Check console (F12)
2. Check Network tab
3. Verify backend đang chạy
4. Verify Cloudinary config
5. Test với ảnh nhỏ (< 1MB) trước

---

**Người thực hiện:** Sinh viên 2 - Frontend  
**Ngày:** 31/10/2025  
**Status:** ✅ Hoàn thành
