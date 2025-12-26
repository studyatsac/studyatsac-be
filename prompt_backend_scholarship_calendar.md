# Backend API Requirements: Scholarship Calendar Feature

## Overview

Implementasi sistem API untuk fitur **Scholarship Calendar** pada aplikasi Study@SAC. Fitur ini memungkinkan pengguna untuk melihat jadwal scholarship (beasiswa) yang tersedia, dengan kemampuan admin untuk mengelola data scholarship calendar.

---

## Database Schema

### Table: `scholarship_calendar`

```sql
CREATE TABLE scholarship_calendar (
  id INT PRIMARY KEY AUTO_INCREMENT,
  scholarship_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  start_date DATETIME NOT NULL,
  end_date DATETIME NOT NULL,
  registration_deadline DATETIME,
  announcement_date DATETIME,
  event_type ENUM('registration', 'deadline', 'announcement', 'interview', 'exam', 'other') DEFAULT 'other',
  location VARCHAR(255),
  is_online BOOLEAN DEFAULT FALSE,
  url VARCHAR(500),
  status ENUM('upcoming', 'ongoing', 'completed', 'cancelled') DEFAULT 'upcoming',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (scholarship_id) REFERENCES scholarships(id) ON DELETE CASCADE
);
```

**Field Descriptions:**

- `scholarship_id`: ID beasiswa yang terkait dengan event ini
- `title`: Judul event (misal: "Registration Period", "Interview Schedule")
- `description`: Deskripsi detail event
- `start_date`: Tanggal dan waktu mulai event
- `end_date`: Tanggal dan waktu selesai event
- `registration_deadline`: Batas waktu pendaftaran (opsional)
- `announcement_date`: Tanggal pengumuman (opsional)
- `event_type`: Jenis event (registrasi, deadline, pengumuman, interview, ujian, lainnya)
- `location`: Lokasi event (jika offline)
- `is_online`: Flag apakah event online atau offline
- `url`: Link terkait (misal: form pendaftaran, meeting link)
- `status`: Status event (mendatang, berlangsung, selesai, dibatalkan)

---

## API Endpoints

> [!NOTE]
> Routes mengikuti pattern yang sudah ada di project seperti `/scholarship` dan `/admin/scholarship/create`
>
> Ada 2 endpoint berbeda untuk mendukung 2 tampilan frontend (public/user):
>
> - **List View**: `/scholarship-calendar` - untuk tampilan list biasa
> - **Calendar View**: `/scholarship-calendar/calendar` - untuk tampilan kalender (require month & year)
>
> Admin hanya menggunakan **List View** tanpa calendar view.

### **PUBLIC/USER ENDPOINTS**

#### 1. **GET /api/scholarship-calendar** (List View)

Mendapatkan semua event scholarship calendar dalam bentuk list (public access, authentication optional)

**Headers:**

```json
{
  "Authorization": "Bearer {token}"
}
```

**Query Parameters:**

- `page` (optional, default: 1): Halaman
- `limit` (optional, default: 10): Jumlah data per halaman
- `scholarship_id` (optional): Filter berdasarkan scholarship tertentu
- `event_type` (optional): Filter berdasarkan tipe event
- `status` (optional): Filter berdasarkan status (upcoming/ongoing/completed/cancelled)
- `start_date` (optional, format: YYYY-MM-DD): Filter event mulai dari tanggal
- `end_date` (optional, format: YYYY-MM-DD): Filter event sampai tanggal
- `search` (optional): Search berdasarkan title atau description

**Success Response (200):**

```json
{
  "success": true,
  "message": "Scholarship calendar retrieved successfully",
  "data": {
    "events": [
      {
        "id": 1,
        "scholarship_id": 10,
        "scholarship_name": "Beasiswa Unggulan 2025",
        "title": "Registration Period",
        "description": "Periode pendaftaran beasiswa unggulan",
        "start_date": "2025-01-01T00:00:00Z",
        "end_date": "2025-01-31T23:59:59Z",
        "registration_deadline": "2025-01-31T23:59:59Z",
        "announcement_date": null,
        "event_type": "registration",
        "location": null,
        "is_online": true,
        "url": "https://example.com/register",
        "status": "upcoming",
        "created_at": "2024-12-01T10:00:00Z",
        "updated_at": "2024-12-01T10:00:00Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 5,
      "total_items": 50,
      "items_per_page": 10,
      "has_next": true,
      "has_prev": false
    }
  }
}
```

#### 2. **GET /api/scholarship-calendar/calendar** (Calendar View)

Mendapatkan event scholarship calendar untuk tampilan kalender bulanan

**Headers:**

```json
{
  "Authorization": "Bearer {token}" // Optional untuk public access
}
```

**Query Parameters:**

- `month` **(required)**, format: `YYYY-MM` atau `MM`: Bulan yang ingin ditampilkan (misal: `2025-01` atau `01`)
- `year` **(required)**, format: `YYYY`: Tahun yang ingin ditampilkan (misal: `2025`)
- `scholarship_id` (optional): Filter berdasarkan scholarship tertentu
- `event_type` (optional): Filter berdasarkan tipe event
- `status` (optional): Filter berdasarkan status

**Success Response (200):**

```json
{
  "success": true,
  "message": "Scholarship calendar retrieved successfully",
  "data": {
    "month": "2025-01",
    "year": 2025,
    "events": [
      {
        "id": 1,
        "scholarship_id": 10,
        "scholarship_name": "Beasiswa Unggulan 2025",
        "title": "Registration Period",
        "description": "Periode pendaftaran beasiswa unggulan",
        "start_date": "2025-01-01T00:00:00Z",
        "end_date": "2025-01-31T23:59:59Z",
        "registration_deadline": "2025-01-31T23:59:59Z",
        "announcement_date": null,
        "event_type": "registration",
        "location": null,
        "is_online": true,
        "url": "https://example.com/register",
        "status": "upcoming",
        "created_at": "2024-12-01T10:00:00Z",
        "updated_at": "2024-12-01T10:00:00Z"
      }
    ],
    "total_events": 15
  }
}
```

> [!IMPORTANT]
> Untuk calendar view, bulan dan tahun adalah **required parameters**. Backend harus return semua event yang terjadi pada bulan-tahun tersebut berdasarkan `start_date`.

**Error Response (400):**

```json
{
  "success": false,
  "message": "Validation error",
  "errors": {
    "month": ["Month is required for calendar view"],
    "year": ["Year is required for calendar view"]
  }
}
```

#### 3. **GET /api/scholarship-calendar/:id**

Mendapatkan detail event scholarship calendar tertentu

**Headers:**

```json
{
  "Authorization": "Bearer {token}" // Optional untuk public access
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Scholarship calendar event retrieved successfully",
  "data": {
    "id": 1,
    "scholarship_id": 10,
    "scholarship_name": "Beasiswa Unggulan 2025",
    "scholarship_description": "Deskripsi beasiswa...",
    "title": "Registration Period",
    "description": "Periode pendaftaran beasiswa unggulan",
    "start_date": "2025-01-01T00:00:00Z",
    "end_date": "2025-01-31T23:59:59Z",
    "registration_deadline": "2025-01-31T23:59:59Z",
    "announcement_date": null,
    "event_type": "registration",
    "location": null,
    "is_online": true,
    "url": "https://example.com/register",
    "status": "upcoming",
    "created_at": "2024-12-01T10:00:00Z",
    "updated_at": "2024-12-01T10:00:00Z"
  }
}
```

**Error Response (404):**

```json
{
  "success": false,
  "message": "Scholarship calendar event not found",
  "data": null
}
```

---

### **ADMIN ENDPOINTS** (Requires Admin Authentication)

#### 4. **GET /api/admin/scholarship-calendar** (List View)

Mendapatkan semua event scholarship calendar dalam bentuk list (admin)

**Headers:**

```json
{
  "Authorization": "Bearer {admin_token}"
}
```

**Query Parameters:**

- `page` (optional, default: 1)
- `limit` (optional, default: 10)
- `scholarship_id` (optional)
- `event_type` (optional)
- `status` (optional)
- `search` (optional): Search berdasarkan title atau description
- `sort_by` (optional, default: start_date): Field untuk sorting
- `sort_order` (optional, default: asc): asc atau desc

**Success Response (200):** Same format as public list endpoint

#### 5. **GET /api/admin/scholarship-calendar/:id**

Mendapatkan detail event scholarship calendar tertentu (admin)

**Success Response (200):** Same format as public detail endpoint

#### 6. **POST /api/admin/scholarship-calendar/create**

Membuat event scholarship calendar baru

**Headers:**

```json
{
  "Authorization": "Bearer {admin_token}",
  "Content-Type": "application/json"
}
```

**Request Body:**

```json
{
  "scholarship_id": 10,
  "title": "Registration Period",
  "description": "Periode pendaftaran beasiswa unggulan",
  "start_date": "2025-01-01T00:00:00Z",
  "end_date": "2025-01-31T23:59:59Z",
  "registration_deadline": "2025-01-31T23:59:59Z",
  "announcement_date": null,
  "event_type": "registration",
  "location": null,
  "is_online": true,
  "url": "https://example.com/register",
  "status": "upcoming"
}
```

**Validation Rules:**

- `scholarship_id`: Required, integer, must exist in scholarships table
- `title`: Required, string, max 255 characters
- `description`: Optional, string
- `start_date`: Required, valid datetime format, ISO 8601
- `end_date`: Required, valid datetime format, must be after start_date
- `registration_deadline`: Optional, valid datetime format
- `announcement_date`: Optional, valid datetime format
- `event_type`: Optional, enum (registration/deadline/announcement/interview/exam/other)
- `location`: Optional, string, max 255 characters
- `is_online`: Optional, boolean
- `url`: Optional, valid URL format, max 500 characters
- `status`: Optional, enum (upcoming/ongoing/completed/cancelled)

**Success Response (201):**

```json
{
  "success": true,
  "message": "Scholarship calendar event created successfully",
  "data": {
    "id": 1,
    "scholarship_id": 10,
    "title": "Registration Period",
    "description": "Periode pendaftaran beasiswa unggulan",
    "start_date": "2025-01-01T00:00:00Z",
    "end_date": "2025-01-31T23:59:59Z",
    "registration_deadline": "2025-01-31T23:59:59Z",
    "announcement_date": null,
    "event_type": "registration",
    "location": null,
    "is_online": true,
    "url": "https://example.com/register",
    "status": "upcoming",
    "created_at": "2024-12-25T20:49:13Z",
    "updated_at": "2024-12-25T20:49:13Z"
  }
}
```

**Error Response (400):**

```json
{
  "success": false,
  "message": "Validation error",
  "errors": {
    "scholarship_id": ["Scholarship ID is required"],
    "title": ["Title is required"],
    "start_date": ["Start date is required"],
    "end_date": ["End date must be after start date"]
  }
}
```

#### 7. **PUT /api/admin/scholarship-calendar/:id**

Mengupdate event scholarship calendar

**Headers:**

```json
{
  "Authorization": "Bearer {admin_token}",
  "Content-Type": "application/json"
}
```

**Request Body:** Same format as POST (all fields optional except those being updated)

**Success Response (200):**

```json
{
  "success": true,
  "message": "Scholarship calendar event updated successfully",
  "data": {
    // Updated event object
  }
}
```

**Error Response (404):**

```json
{
  "success": false,
  "message": "Scholarship calendar event not found",
  "data": null
}
```

#### 8. **DELETE /api/admin/scholarship-calendar/:id**

Menghapus event scholarship calendar

**Headers:**

```json
{
  "Authorization": "Bearer {admin_token}"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Scholarship calendar event deleted successfully",
  "data": null
}
```

**Error Response (404):**

```json
{
  "success": false,
  "message": "Scholarship calendar event not found",
  "data": null
}
```

---

## Express.js Routing Implementation

Berikut contoh implementasi routing sesuai pattern project yang ada:

```javascript
// Tambahkan di file routes utama (misal: routes/index.js atau routes/api.js)

// scholarship-calendar (Public/User endpoints)
// IMPORTANT: Calendar route harus didefinisikan SEBELUM :id route
router.get(
  "/scholarship-calendar/calendar",
  [], // Optional auth
  require("../methods/v1/scholarship-calendar/calendar")
    .getScholarshipCalendarByMonth
);

router.get(
  "/scholarship-calendar/:id",
  [], // Optional auth
  require("../methods/v1/scholarship-calendar/detail")
    .getScholarshipCalendarDetail
);

router.get(
  "/scholarship-calendar",
  [],
  require("../methods/v1/scholarship-calendar/list").getScholarshipCalendarList
);

// scholarship-calendar (Admin endpoints)
router.get(
  "/admin/scholarship-calendar",
  [tokenMiddleware, adminOnlyMiddleware],
  require("../methods/v1/scholarship-calendar/admin_list")
    .getScholarshipCalendarListAdmin
);

router.post(
  "/admin/scholarship-calendar/create",
  [tokenMiddleware, adminOnlyMiddleware],
  require("../methods/v1/scholarship-calendar/admin_create")
    .createScholarshipCalendar
);

router.put(
  "/admin/scholarship-calendar/:id",
  [tokenMiddleware, adminOnlyMiddleware],
  require("../methods/v1/scholarship-calendar/admin_update")
    .updateScholarshipCalendar
);

router.delete(
  "/admin/scholarship-calendar/:id",
  [tokenMiddleware, adminOnlyMiddleware],
  require("../methods/v1/scholarship-calendar/admin_delete")
    .deleteScholarshipCalendar
);

router.get(
  "/admin/scholarship-calendar/:id",
  [tokenMiddleware, adminOnlyMiddleware],
  require("../methods/v1/scholarship-calendar/admin_detail")
    .getScholarshipCalendarDetailAdmin
);
```

### File Structure

Buat file-file method handler di `methods/v1/scholarship-calendar/` dengan struktur:

```
methods/v1/scholarship-calendar/
├── list.js                 (GET /scholarship-calendar) - List view
├── calendar.js             (GET /scholarship-calendar/calendar) - Calendar view (public only)
├── detail.js               (GET /scholarship-calendar/:id) - Detail view
├── admin_list.js           (GET /admin/scholarship-calendar) - Admin list view
├── admin_detail.js         (GET /admin/scholarship-calendar/:id) - Admin detail view
├── admin_create.js         (POST /admin/scholarship-calendar/create) - Create
├── admin_update.js         (PUT /admin/scholarship-calendar/:id) - Update
└── admin_delete.js         (DELETE /admin/scholarship-calendar/:id) - Delete
```

> [!IMPORTANT] > **Route Order Penting!**
> Pastikan route `/scholarship-calendar/calendar` didefinisikan **SEBELUM** route `/scholarship-calendar/:id` agar tidak bentrok. Express.js mengecek route secara berurutan dari atas ke bawah.

---

## Technical Requirements

### Authentication & Authorization

1. **Public endpoints** (`/scholarship-calendar`): Bisa diakses tanpa authentication, atau optional authentication
2. **Admin endpoints**: Memerlukan `tokenMiddleware` dan `adminOnlyMiddleware`
3. Return 401 jika token tidak valid atau expired
4. Return 403 jika user tidak memiliki permission yang sesuai

### Error Handling

Implementasi error handling yang konsisten:

```json
{
  "success": false,
  "message": "Error message",
  "errors": {
    // Validation errors (optional)
  }
}
```

**HTTP Status Codes:**

- `200`: Success (GET, PUT, DELETE)
- `201`: Created (POST)
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (authentication required)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `500`: Internal Server Error

### Data Format

1. Semua request dan response menggunakan format JSON
2. Tanggal menggunakan format ISO 8601 (YYYY-MM-DDTHH:mm:ssZ)
3. Support both `snake_case` dan `camelCase` untuk kompatibilitas
4. Response harus konsisten menggunakan `snake_case`

### Logging

Implementasi logging untuk:

1. Semua request yang masuk
2. Error yang terjadi
3. Operasi CRUD pada scholarship calendar
4. Authentication/authorization failures

### Performance

1. Implementasi pagination untuk list endpoints
2. Indexing pada field: `scholarship_id`, `start_date`, `end_date`, `status`
3. Caching untuk data yang sering diakses (optional)

### Additional Features

1. **Auto Status Update**: Implementasi background job untuk update status event:
   - `upcoming` → `ongoing` jika tanggal sekarang >= start_date
   - `ongoing` → `completed` jika tanggal sekarang > end_date
2. **Calendar View Support**: Endpoint harus mendukung filtering by month/year untuk tampilan kalender
3. **Timezone**: Semua datetime disimpan dalam UTC

---

## Testing Requirements

### Unit Tests

- Test untuk setiap endpoint
- Test validasi input
- Test error handling
- Test authentication & authorization

### Integration Tests

- Test flow CRUD lengkap
- Test filtering dan pagination
- Test dengan database

### Test Data

Sediakan seeder/fixture dengan minimal 20 sample scholarship calendar events untuk testing

---

## Migration Steps

1. Create migration file untuk table `scholarship_calendar`
2. Run migration
3. Create seeder untuk sample data
4. Implement model/entity
5. Implement repository/data access layer
6. Implement validation schemas
7. Implement business logic/services
8. Implement controllers/routes
9. Add authentication/authorization middleware
10. Add logging
11. Write tests
12. Documentation (API docs)

---

## Dependencies

Pastikan dependency berikut tersedia:

- Framework backend (Express.js/NestJS/FastAPI/Laravel/etc)
- Database driver (MySQL/PostgreSQL)
- JWT library untuk authentication
- Validation library (Joi/Zod/class-validator)
- Date/time library (day.js/date-fns/luxon)

---

## Documentation

Buat API documentation menggunakan:

- Swagger/OpenAPI specification, atau
- Postman collection, atau
- API Blueprint

---

## Notes

1. Pastikan semua endpoint menggunakan `async/await` untuk operasi database
2. Gunakan prepared statements untuk mencegah SQL injection
3. Implementasi rate limiting untuk mencegah abuse
4. Pastikan response time < 500ms untuk operasi normal
5. Support CORS untuk frontend integration
6. Implementasi soft delete (optional) dengan menambahkan field `deleted_at`

---

## Questions & Clarifications Needed

Jika ada yang perlu dikonfirmasi saat implementasi:

1. Apakah perlu notifikasi email/push untuk upcoming events?
2. Apakah user bisa subscribe/bookmark event tertentu?
3. Apakah perlu export calendar ke format iCal/Google Calendar?
4. Apakah perlu reminder system untuk deadline?
5. Timezone apa yang digunakan untuk display (WIB/WITA/WIT)?
