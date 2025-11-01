# 📜 Frontend Activity Logging & Rate Limiting - Sinh Viên 2

## 🎯 Mục tiêu
Tạo giao diện hiển thị activity logs cho Admin và demo rate limiting khi login.

---

## ✅ Đã hoàn thành

### 1. **Component ActivityLogs.jsx**
📍 **Vị trí:** `frontend/src/ActivityLogs.jsx`

**Tính năng:**
- ✅ Hiển thị tất cả logs từ backend API `/api/users/logs/all`
- ✅ Filter theo action type (all, login, logout, update, delete, create)
- ✅ Search theo email user
- ✅ Hiển thị: User email, Role, Action, IP, Timestamp
- ✅ Icon màu sắc theo loại action
- ✅ Stats: Tổng logs, Login count, Logout count, Updates count
- ✅ Refresh button để reload logs
- ✅ Responsive table với scroll

**Code chính:**
```jsx
// Fetch logs từ backend
const res = await axiosInstance.get('/users/logs/all');
setLogs(res.data?.logs || []);

// Filter logs
const filteredLogs = logs.filter(log => {
  if (filter !== 'all' && !log.action.toLowerCase().includes(filter)) {
    return false;
  }
  if (searchEmail && !log.user?.email?.includes(searchEmail)) {
    return false;
  }
  return true;
});

// Display in table
{filteredLogs.map((log, index) => (
  <tr key={log._id}>
    <td>{log.user?.email}</td>
    <td>{log.action}</td>
    <td>{log.ip}</td>
    <td>{formatTime(log.timestamp)}</td>
  </tr>
))}
```

---

### 2. **Component RateLimitDemo.jsx**
📍 **Vị trí:** `frontend/src/RateLimitDemo.jsx`

**Tính năng:**
- ✅ Form test login với email/password bất kỳ
- ✅ Hiển thị số lần thử: X / 5
- ✅ Hiển thị status: OK hoặc RATE LIMITED
- ✅ Request logs với timestamp, status code, message
- ✅ Auto detect 429 status (rate limited)
- ✅ Reset button để test lại
- ✅ Hướng dẫn test chi tiết

**Code chính:**
```jsx
const attemptLogin = async () => {
  try {
    const res = await axiosInstance.post('/auth/login', { email, password });
    setMessage({ type: 'success', text: '✅ Login thành công!' });
    
  } catch (err) {
    if (err.response?.status === 429) {
      setRateLimited(true);
      setMessage({ type: 'error', text: '🚫 BỊ CHẶN! Rate limit exceeded' });
    } else {
      setMessage({ type: 'error', text: '❌ Login failed' });
    }
  }
  
  setAttempts(prev => prev + 1);
};
```

---

### 3. **Cập nhật App.js**
Thêm 2 menu mới cho Admin:
- **📜 Activity Logs** - Xem logs hoạt động
- **🛡️ Rate Limit** - Demo rate limiting

```jsx
{userRole === 'admin' && (
  <>
    <button onClick={() => setView('activity-logs')}>
      📜 Activity Logs
    </button>
    <button onClick={() => setView('rate-limit-demo')}>
      🛡️ Rate Limit
    </button>
  </>
)}

// Routing
{view === 'activity-logs' ? (
  <ActivityLogs />
) : view === 'rate-limit-demo' ? (
  <RateLimitDemo />
) : ...}
```

---

## 🔄 Flow hoàn chỉnh

### **Activity Logs:**
```
Admin login → Click "📜 Activity Logs" → 
Frontend call GET /api/users/logs/all → 
Backend query Log collection → 
Populate user info → Return logs → 
Frontend hiển thị table với filter/search
```

### **Rate Limiting:**
```
User thử login sai → Frontend POST /auth/login → 
Backend check rate limiter (5 attempts / 10 min) → 
Nếu > 5 lần: Return 429 Too Many Requests → 
Frontend hiển thị "🚫 BỊ CHẶN!" → 
User phải đợi 10 phút
```

---

## 🧪 Cách Test

### **Test 1: Activity Logs**

**Bước 1:** Đăng nhập với tài khoản Admin
```
Email: admin@example.com
Password: (password admin)
```

**Bước 2:** Click menu "📜 Activity Logs"

**Bước 3:** Kiểm tra UI:
- ✅ Hiển thị table với logs
- ✅ Filter buttons: All, Login, Logout, Update, Delete, Create
- ✅ Search box tìm theo email
- ✅ Refresh button

**Bước 4:** Test filter:
- Click "🔐 Login" → Chỉ hiển thị login logs
- Click "🚪 Logout" → Chỉ hiển thị logout logs
- Nhập email vào search → Filter theo email

**Bước 5:** Kiểm tra data:
- User email + role badge (Admin/Moderator/User)
- Action với icon màu sắc
- IP address
- Timestamp format đẹp

**Bước 6:** Kiểm tra stats:
- Total logs
- Login count
- Logout count  
- Updates count

---

### **Test 2: Rate Limiting**

**Bước 1:** Click menu "🛡️ Rate Limit"

**Bước 2:** Nhập thông tin test:
```
Email: test@example.com (bất kỳ)
Password: wrongpassword (sai để fail)
```

**Bước 3:** Click "🔐 Thử Login (Sai)" nhiều lần:
- Lần 1: ❌ Login failed → Attempts: 1/5
- Lần 2: ❌ Login failed → Attempts: 2/5
- Lần 3: ❌ Login failed → Attempts: 3/5
- Lần 4: ❌ Login failed → Attempts: 4/5
- Lần 5: ❌ Login failed → Attempts: 5/5
- Lần 6: 🚫 **BỊ CHẶN!** → Status 429

**Bước 4:** Kiểm tra logs:
- Mỗi request có timestamp
- Status code: 401 (unauthorized) hoặc 429 (rate limited)
- Message rõ ràng
- Background màu đỏ khi bị chặn

**Bước 5:** Click "🔄 Reset" để test lại

**Lưu ý:** Sau khi bị chặn, phải đợi **10 phút** mới login được (backend config)

---

## 📸 Screenshot cần chụp

### 1. **Activity Logs Table**
- Table với nhiều logs
- Highlight filter buttons
- Stats ở dưới table

### 2. **Activity Logs Filter**
- Click filter "🔐 Login"
- Table chỉ hiển thị login logs

### 3. **Activity Logs Search**
- Nhập email vào search box
- Table filter theo email

### 4. **Rate Limit Demo - OK**
- Status: ✅ OK
- Attempts: 0/5 hoặc 3/5

### 5. **Rate Limit Demo - BLOCKED**
- Status: 🚫 RATE LIMITED!
- Attempts: 6/5
- Button "Thử Login" bị disable
- Logs hiển thị status 429

### 6. **Rate Limit Logs**
- Request logs với nhiều attempts
- Highlight status 429 màu đỏ

---

## 🎨 UI/UX Design

### **Colors:**
- Admin Orange: `#ff9800`
- Success Green: `#4caf50`
- Error Red: `#f44336`
- Warning Orange: `#ff9800`
- Info Blue: `#2196f3`
- Purple: `#9c27b0`
- Gray: `#757575`

### **Action Icons:**
- 🔐 Login
- 🚪 Logout
- ✏️ Update/Edit
- 🗑️ Delete
- ➕ Create/Add
- 👁️ View/Read
- 📝 Other

### **Layout:**
```
┌────────────────────────────────────┐
│ 📜 Activity Logs       [19 logs]   │
│ Lịch sử hoạt động                  │
├────────────────────────────────────┤
│ [🔍 Search] [All] [Login] [Logout] │
│ [Update] [Delete] [Create] [🔄]    │
├────────────────────────────────────┤
│ # │ User      │ Action │ IP │ Time │
│ 1 │ admin@... │ Login  │... │ ...  │
│ 2 │ user@...  │ Logout │... │ ...  │
├────────────────────────────────────┤
│ 📊 Total: 19 | 🔐 Login: 8         │
└────────────────────────────────────┘
```

---

## 🐛 Troubleshooting

### Lỗi: "403 Forbidden" khi GET /users/logs/all
**Nguyên nhân:** User không phải Admin  
**Giải pháp:** Đăng nhập với tài khoản Admin

### Lỗi: "Không có logs"
**Nguyên nhân:** Database chưa có logs  
**Giải pháp:** 
1. Login/logout vài lần để tạo logs
2. Backend phải log activity khi user thao tác

### Lỗi: Rate limit không hoạt động
**Nguyên nhân:** Backend chưa áp dụng middleware  
**Giải pháp:** SV1 phải thêm `loginLimiter` vào route:
```js
router.post('/auth/login', loginLimiter, authController.login);
```

### Lỗi: Status code không phải 429
**Nguyên nhân:** Backend chưa config đúng rate limit  
**Giải pháp:** Check `rateLimiter.js`:
```js
const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 phút
  max: 5, // Tối đa 5 lần
  message: { message: "Rate limit exceeded" }
});
```

---

## 📝 Git Workflow - Sinh viên 2

### **Tạo branch:**
```bash
git checkout -b feature/log-rate-limit
```

### **Add files:**
```bash
git add frontend/src/ActivityLogs.jsx
git add frontend/src/RateLimitDemo.jsx
git add frontend/src/App.js
```

### **Commit:**
```bash
git commit -m "Frontend: Thêm logging và rate limiting

- Tạo ActivityLogs.jsx hiển thị logs cho Admin
- Filter theo action type và search email
- Stats: total, login, logout, updates
- Tạo RateLimitDemo.jsx test rate limiting
- Hiển thị attempts counter và status
- Request logs với status code 429
- Thêm menu Activity Logs và Rate Limit cho Admin
- UI đẹp với table responsive"
```

### **Push:**
```bash
git push origin feature/log-rate-limit
```

---

## 🔗 API Endpoints (Backend)

### **GET /api/users/logs/all**
**Quyền:** Admin only

**Request:**
```http
GET /api/users/logs/all
Authorization: Bearer <admin_token>
```

**Response (200):**
```json
{
  "message": "✅ Danh sách log hoạt động",
  "logs": [
    {
      "_id": "...",
      "user": {
        "email": "admin@example.com",
        "role": "Admin"
      },
      "action": "User logged in",
      "ip": "127.0.0.1",
      "timestamp": "2025-10-31T10:30:00.000Z",
      "createdAt": "2025-10-31T10:30:00.000Z"
    },
    ...
  ]
}
```

**Response (403):**
```json
{
  "message": "Bạn không có quyền truy cập"
}
```

---

### **POST /api/auth/login** (with rate limiting)

**Request:**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "wrongpassword"
}
```

**Response (401) - Sai password:**
```json
{
  "message": "Mật khẩu không đúng"
}
```

**Response (429) - Rate limited:**
```json
{
  "message": "⚠️ Bạn đã đăng nhập quá nhiều lần. Vui lòng thử lại sau 10 phút."
}
```

---

## ✨ Điểm cộng

- ✅ **UI chuyên nghiệp** - Table đẹp, filter smooth
- ✅ **Real-time filtering** - Filter + search không reload
- ✅ **Icon system** - Mỗi action có icon riêng
- ✅ **Color coding** - Status colors rõ ràng
- ✅ **Stats dashboard** - Tổng quan nhanh
- ✅ **Rate limit demo** - Test trực quan
- ✅ **Request logs** - Debug dễ dàng
- ✅ **Responsive** - Mobile friendly
- ✅ **Admin only** - Security tốt

---

## 📚 Dependencies

```json
{
  "axios": "^1.12.2",
  "react": "^19.2.0"
}
```

**Backend cần:**
```json
{
  "express-rate-limit": "^7.0.0"
}
```

---

## 🎓 Kiến thức Frontend cần nắm

1. **Array filtering**
   - `.filter()` với multiple conditions
   - Case-insensitive search

2. **Date formatting**
   - `new Date().toLocaleString()`
   - Timezone handling

3. **Conditional styling**
   - Dynamic colors based on data
   - Hover effects

4. **Error handling**
   - Catch 429 status specifically
   - Display rate limit messages

5. **State management**
   - Multiple filters
   - Request history

---

## 📞 Phân công Team

| Thành viên | Công việc | Trạng thái |
|------------|-----------|------------|
| **SV1** | Middleware `logActivity.js` | ✅ Hoàn thành |
| **SV1** | Middleware `rateLimiter.js` | ✅ Hoàn thành |
| **SV1** | Route `/users/logs/all` | ✅ Hoàn thành |
| **SV1** | Apply rate limit to `/auth/login` | ⏳ Cần check |
| **SV2** | Frontend `ActivityLogs.jsx` | ✅ Hoàn thành |
| **SV2** | Frontend `RateLimitDemo.jsx` | ✅ Hoàn thành |
| **SV3** | Model `Log.js` | ✅ Hoàn thành |
| **SV3** | Test logs trong MongoDB | ⏳ Cần test |

---

## 🚀 Next Steps

### **Ngay bây giờ:**
1. Test ActivityLogs với tài khoản Admin
2. Test RateLimitDemo (login sai 6 lần)
3. Chụp screenshot UI
4. Tạo Git branch và commit

### **Yêu cầu SV1:**
1. Verify rate limiter đã áp dụng vào `/auth/login`
2. Verify logs được ghi khi user login/logout

### **Yêu cầu SV3:**
1. Check collection `logs` trong MongoDB
2. Test query logs với Postman

### **Sau khi test xong:**
1. Chụp ảnh Postman test API `/users/logs/all`
2. Chụp ảnh demo rate limit (status 429)
3. Tạo Pull Request
4. Nộp link PR cho giáo viên

---

**Người thực hiện:** Sinh viên 2 - Frontend  
**Ngày:** 31/10/2025  
**Status:** ✅ Hoàn thành Frontend
