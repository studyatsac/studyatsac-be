# Certificate Management - Quick Reference

## 🚀 Quick Start

### 1. Database Setup
```sql
-- Run this migration
mysql -u root -p your_database < database/migrations/20251215000001.sql
```

### 2. Environment Variables
Ensure these are set in your `.env`:
```
DB_HOST=localhost
DB_USER=your_user
DB_PASSWORD=your_password
DB_NAME=your_database
JWT_SECRET=your_jwt_secret
```

## 📋 API Endpoints Cheat Sheet

### User Endpoints (Require Token)

```bash
# Get my certificates
GET /api/v1/certificate/:userid

# Get certificate detail  
GET /api/v1/certificate/user/:certificate_id
```

### Admin Endpoints (Require Admin Token)

```bash
# Create certificate
POST /api/v1/certificate

# List all certificates (with pagination & search)
GET /api/v1/admin/certificate/list?page=1&limit=10&search=TOEFL

# Get certificate detail
GET /api/v1/admin/certificate/:certificate_id

# Update certificate
PUT /api/v1/admin/certificate/:certificate_id

# Delete certificate
DELETE /api/v1/admin/certificate/delete/:certificate_id
```

## 🔑 Authentication Header

All requests need:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

## 📝 Example Requests

### Create Certificate
```bash
curl -X POST http://localhost:3000/api/v1/certificate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "certificateName": "TOEFL ITP Prediction",
    "certificateType": "TOEFL ITP",
    "certificateNumber": "017/SAC/TOEFL/XI/2025",
    "issuedDate": "2025-11-15",
    "overallScore": 580
  }'
```

### Get User Certificates
```bash
curl -X GET http://localhost:3000/api/v1/certificate/1 \
  -H "Authorization: Bearer $TOKEN"
```

### Search Certificates (Admin)
```bash
curl -X GET "http://localhost:3000/api/v1/admin/certificate/list?search=TOEFL&page=1&limit=20" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### Update Certificate (Admin)
```bash
curl -X PUT http://localhost:3000/api/v1/admin/certificate/UUID \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"overallScore": 600}'
```

## 📊 Response Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (no/invalid token) |
| 403 | Forbidden (not admin/not owner) |
| 404 | Not Found |
| 500 | Server Error |

## 🔍 Query Parameters

### List Endpoint (`/admin/certificate/list`)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `search` - Search term (searches name, number, type, user)
- `orderBy` - Sort field (default: created_at)
- `order` - Sort direction: asc/desc (default: desc)

## 📦 Required Fields

### Create Certificate
- ✅ userId
- ✅ certificateName
- ✅ issuedDate
- Optional: all other fields

### Update Certificate
- All fields optional

## 🗂️ Files Created/Updated

```
database/migrations/
  └── 20251215000001.sql ........................... [NEW] Database schema

src/models/mysql/
  └── certificate.js ................................ [NEW] Sequelize model

src/repositories/mysql/
  └── certificate.js ................................ [UPDATED] Repository

src/validations/v1/certificate/
  ├── create.js ..................................... [NEW] Create validation
  └── update.js ..................................... [NEW] Update validation

src/methods/v1/certificate/
  ├── create.js ..................................... [NEW] Create method
  ├── detail.js ..................................... [NEW] Detail method
  ├── detail_userID.js .............................. [NEW] Get by user ID
  ├── admin_list.js ................................. [NEW] Admin list
  ├── admin_update.js ............................... [NEW] Admin update
  └── admin_delete.js ............................... [NEW] Admin delete

src/routes/
  └── v1.js ......................................... [UPDATED] Added PUT route

docs/
  ├── CERTIFICATE_API.md ............................ [NEW] Full API docs
  ├── CERTIFICATE_IMPLEMENTATION.md ................. [NEW] Implementation guide
  └── CERTIFICATE_QUICK_REFERENCE.md ................ [NEW] This file
```

## 💡 Common Use Cases

### 1. Issue Certificate After Exam
```javascript
// After user completes exam
POST /certificate
{
  "userId": examResult.userId,
  "certificateName": "TOEFL ITP Prediction Test",
  "certificateType": "TOEFL ITP",
  "issuedDate": new Date(),
  "overallScore": examResult.totalScore
}
```

### 2. Student Views Their Certificates
```javascript
// User dashboard
GET /certificate/{userId}
```

### 3. Admin Searches Certificates
```javascript
// Admin panel
GET /admin/certificate/list?search=john@email.com&page=1&limit=20
```

### 4. Update Certificate Score
```javascript
// Fix incorrect score
PUT /admin/certificate/{certificateId}
{
  "overallScore": 600
}
```

## 🔐 Authorization Rules

| Endpoint | Who Can Access |
|----------|----------------|
| `/certificate/:userid` | Owner OR Admin |
| `/certificate/user/:id` | Owner OR Admin |
| `/certificate` (POST) | Any authenticated user |
| `/admin/certificate/*` | Admin only |

## 🛠️ Debugging Tips

### Check Logs
All operations are logged. Check console for:
- `Certificate created: UUID`
- `Certificate updated: UUID`
- `Retrieved X certificates for user: ID`

### Common Errors

**"User not found"**
```sql
SELECT * FROM users WHERE id = ?
```

**"Forbidden: You can only access your own certificates"**
- Check userId in token matches requested userId
- Or ensure user has admin role

**Validation errors**
- Check all required fields
- Verify data types
- Ensure scores 0-100

## 📞 Quick Help

1. **Full docs**: `docs/CERTIFICATE_API.md`
2. **Implementation details**: `docs/CERTIFICATE_IMPLEMENTATION.md`
3. **Database schema**: `database/migrations/20251215000001.sql`

---

**Pro Tip**: Use Postman collection from `CERTIFICATE_API.md` for easy testing!
