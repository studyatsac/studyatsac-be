# Certificate Management API Documentation

## Overview
This document provides complete documentation for the Certificate Management API endpoints in the Study Abroad Center (SAC) application.

**Base URL**: `http://your-domain.com/api/v1`
**Authentication**: JWT Bearer Token (required for all endpoints)

---

## Table of Contents
1. [User Endpoints](#user-endpoints)
2. [Admin Endpoints](#admin-endpoints)
3. [Response Format](#response-format)
4. [Error Codes](#error-codes)

---

## User Endpoints

### 1. Get All Certificates by User ID

**Endpoint**: `GET /certificate/:userid`

**Description**: Retrieve all certificates for a specific user. Users can only access their own certificates unless they have admin privileges.

**Authentication**: Required (JWT Token)

**Authorization**: User can only access their own certificates (admin can access any)

**Request**:
```bash
curl -X GET "http://localhost:3000/api/v1/certificate/123" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (Success - 200)**:
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "certificateId": "550e8400-e29b-41d4-a716-446655440000",
      "userId": 123,
      "certificateName": "TOEFL ITP Prediction Test",
      "certificateType": "TOEFL ITP PREDICTION",
      "certificateNumber": "017/SAC/TOEFL/XI/2025",
      "issuedDate": "2025-11-15",
      "testDate": "2025-11-10",
      "validUntil": "2027-11-15",
      "listeningScore": 55,
      "structureScore": 60,
      "readingScore": 58,
      "overallScore": 580,
      "directorName": "Riko Susiloputro",
      "certificateUrl": "https://example.com/certificates/cert123.pdf",
      "description": "TOEFL ITP Prediction Test Certificate",
      "createdAt": "2025-11-15T10:30:00.000Z",
      "updatedAt": "2025-11-15T10:30:00.000Z",
      "user": {
        "id": 123,
        "uuid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "full_name": "John Doe",
        "email": "john.doe@example.com",
        "photo_url": "https://example.com/photos/john.jpg",
        "institution_name": "University of Example"
      }
    }
  ]
}
```

**Response (Error - 403 Forbidden)**:
```json
{
  "status": "error",
  "message": "Forbidden: You can only access your own certificates"
}
```

---

### 2. Get Certificate Detail by ID (User)

**Endpoint**: `GET /certificate/user/:certificate_id`

**Description**: Get detailed information about a specific certificate. Users can only view their own certificates.

**Authentication**: Required (JWT Token)

**Authorization**: User can only access their own certificates

**Request**:
```bash
curl -X GET "http://localhost:3000/api/v1/certificate/user/550e8400-e29b-41d4-a716-446655440000" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (Success - 200)**:
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "certificateId": "550e8400-e29b-41d4-a716-446655440000",
    "userId": 123,
    "certificateName": "TOEFL ITP Prediction Test",
    "certificateType": "TOEFL ITP PREDICTION",
    "certificateNumber": "017/SAC/TOEFL/XI/2025",
    "issuedDate": "2025-11-15",
    "testDate": "2025-11-10",
    "validUntil": "2027-11-15",
    "listeningScore": 55,
    "structureScore": 60,
    "readingScore": 58,
    "overallScore": 580,
    "directorName": "Riko Susiloputro",
    "certificateUrl": "https://example.com/certificates/cert123.pdf",
    "description": "TOEFL ITP Prediction Test Certificate",
    "createdAt": "2025-11-15T10:30:00.000Z",
    "updatedAt": "2025-11-15T10:30:00.000Z",
    "user": {
      "id": 123,
      "uuid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "full_name": "John Doe",
      "email": "john.doe@example.com",
      "photo_url": "https://example.com/photos/john.jpg",
      "institution_name": "University of Example"
    }
  }
}
```

**Response (Error - 404 Not Found)**:
```json
{
  "status": "error",
  "message": "Certificate not found"
}
```

---

## Admin Endpoints

### 3. Create Certificate

**Endpoint**: `POST /certificate`

**Description**: Create a new certificate for a user.

**Authentication**: Required (JWT Token)

**Authorization**: Any authenticated user (typically admin)

**Request Body**:
```json
{
  "userId": 123,
  "certificateName": "TOEFL ITP Prediction Test",
  "certificateType": "TOEFL ITP PREDICTION",
  "certificateNumber": "017/SAC/TOEFL/XI/2025",
  "issuedDate": "2025-11-15",
  "testDate": "2025-11-10",
  "validUntil": "2027-11-15",
  "listeningScore": 55,
  "structureScore": 60,
  "readingScore": 58,
  "overallScore": 580,
  "directorName": "Riko Susiloputro",
  "certificateUrl": "https://example.com/certificates/cert123.pdf",
  "description": "TOEFL ITP Prediction Test Certificate"
}
```

**Request**:
```bash
curl -X POST "http://localhost:3000/api/v1/certificate" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 123,
    "certificateName": "TOEFL ITP Prediction Test",
    "certificateType": "TOEFL ITP PREDICTION",
    "certificateNumber": "017/SAC/TOEFL/XI/2025",
    "issuedDate": "2025-11-15",
    "testDate": "2025-11-10",
    "validUntil": "2027-11-15",
    "listeningScore": 55,
    "structureScore": 60,
    "readingScore": 58,
    "overallScore": 580,
    "directorName": "Riko Susiloputro",
    "certificateUrl": "https://example.com/certificates/cert123.pdf",
    "description": "TOEFL ITP Prediction Test Certificate"
  }'
```

**Response (Success - 201 Created)**:
```json
{
  "status": "success",
  "message": "Certificate created successfully",
  "data": {
    "id": 1,
    "certificateId": "550e8400-e29b-41d4-a716-446655440000",
    "userId": 123,
    "certificateName": "TOEFL ITP Prediction Test",
    "certificateType": "TOEFL ITP PREDICTION",
    "certificateNumber": "017/SAC/TOEFL/XI/2025",
    "issuedDate": "2025-11-15",
    "testDate": "2025-11-10",
    "validUntil": "2027-11-15",
    "listeningScore": 55,
    "structureScore": 60,
    "readingScore": 58,
    "overallScore": 580,
    "directorName": "Riko Susiloputro",
    "certificateUrl": "https://example.com/certificates/cert123.pdf",
    "description": "TOEFL ITP Prediction Test Certificate",
    "createdAt": "2025-11-15T10:30:00.000Z",
    "updatedAt": "2025-11-15T10:30:00.000Z",
    "user": {
      "id": 123,
      "uuid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "full_name": "John Doe",
      "email": "john.doe@example.com",
      "photo_url": "https://example.com/photos/john.jpg",
      "institution_name": "University of Example"
    }
  }
}
```

**Response (Error - 400 Bad Request)**:
```json
{
  "status": "error",
  "message": "Certificate name is required and must not exceed 255 characters"
}
```

**Response (Error - 404 Not Found)**:
```json
{
  "status": "error",
  "message": "User not found"
}
```

---

### 4. Get All Certificates (Admin)

**Endpoint**: `GET /admin/certificate/list`

**Description**: Get a paginated list of all certificates with search functionality.

**Authentication**: Required (JWT Token)

**Authorization**: Admin only

**Query Parameters**:
- `page` (optional, default: 1) - Page number
- `limit` (optional, default: 10) - Items per page
- `search` (optional) - Search by certificate name, number, type, or user name/email
- `order` (optional, default: 'desc') - Sort order ('asc' or 'desc')
- `orderBy` (optional, default: 'created_at') - Sort field

**Request**:
```bash
# Basic request
curl -X GET "http://localhost:3000/api/v1/admin/certificate/list" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# With pagination
curl -X GET "http://localhost:3000/api/v1/admin/certificate/list?page=1&limit=20" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# With search
curl -X GET "http://localhost:3000/api/v1/admin/certificate/list?search=TOEFL" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# With sorting
curl -X GET "http://localhost:3000/api/v1/admin/certificate/list?orderBy=issuedDate&order=asc" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (Success - 200)**:
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "certificateId": "550e8400-e29b-41d4-a716-446655440000",
      "userId": 123,
      "certificateName": "TOEFL ITP Prediction Test",
      "certificateType": "TOEFL ITP PREDICTION",
      "certificateNumber": "017/SAC/TOEFL/XI/2025",
      "issuedDate": "2025-11-15",
      "testDate": "2025-11-10",
      "validUntil": "2027-11-15",
      "listeningScore": 55,
      "structureScore": 60,
      "readingScore": 58,
      "overallScore": 580,
      "directorName": "Riko Susiloputro",
      "certificateUrl": "https://example.com/certificates/cert123.pdf",
      "description": "TOEFL ITP Prediction Test Certificate",
      "createdAt": "2025-11-15T10:30:00.000Z",
      "updatedAt": "2025-11-15T10:30:00.000Z",
      "user": {
        "id": 123,
        "uuid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "full_name": "John Doe",
        "email": "john.doe@example.com",
        "photo_url": "https://example.com/photos/john.jpg",
        "institution_name": "University of Example"
      }
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total_data": 100,
    "total_page": 10
  }
}
```

**Response (Error - 403 Forbidden)**:
```json
{
  "status": "error",
  "message": "Forbidden: Admin only"
}
```

---

### 5. Get Certificate Detail (Admin)

**Endpoint**: `GET /admin/certificate/:certificate_id`

**Description**: Get detailed information about a specific certificate (admin version).

**Authentication**: Required (JWT Token)

**Authorization**: Admin only

**Request**:
```bash
curl -X GET "http://localhost:3000/api/v1/admin/certificate/550e8400-e29b-41d4-a716-446655440000" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response**: Same as User detail endpoint (200)

---

### 6. Update Certificate

**Endpoint**: `PUT /admin/certificate/:certificate_id`

**Description**: Update an existing certificate. All fields are optional.

**Authentication**: Required (JWT Token)

**Authorization**: Admin only

**Request Body** (all fields optional):
```json
{
  "certificateName": "IELTS Academic Test",
  "certificateType": "IELTS",
  "certificateNumber": "018/SAC/IELTS/XI/2025",
  "issuedDate": "2025-11-20",
  "testDate": "2025-11-18",
  "validUntil": "2027-11-20",
  "overallScore": 7.5,
  "directorName": "Riko Susiloputro",
  "certificateUrl": "https://example.com/certificates/cert124.pdf",
  "description": "IELTS Academic Test Certificate"
}
```

**Request**:
```bash
curl -X PUT "http://localhost:3000/api/v1/admin/certificate/550e8400-e29b-41d4-a716-446655440000" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "certificateName": "IELTS Academic Test",
    "certificateType": "IELTS",
    "overallScore": 7.5
  }'
```

**Response (Success - 200)**:
```json
{
  "status": "success",
  "message": "Certificate updated successfully",
  "data": {
    "id": 1,
    "certificateId": "550e8400-e29b-41d4-a716-446655440000",
    "userId": 123,
    "certificateName": "IELTS Academic Test",
    "certificateType": "IELTS",
    "certificateNumber": "018/SAC/IELTS/XI/2025",
    "issuedDate": "2025-11-20",
    "testDate": "2025-11-18",
    "validUntil": "2027-11-20",
    "listeningScore": null,
    "structureScore": null,
    "readingScore": null,
    "overallScore": 7.5,
    "directorName": "Riko Susiloputro",
    "certificateUrl": "https://example.com/certificates/cert124.pdf",
    "description": "IELTS Academic Test Certificate",
    "createdAt": "2025-11-15T10:30:00.000Z",
    "updatedAt": "2025-11-20T14:45:00.000Z",
    "user": {
      "id": 123,
      "uuid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "full_name": "John Doe",
      "email": "john.doe@example.com",
      "photo_url": "https://example.com/photos/john.jpg",
      "institution_name": "University of Example"
    }
  }
}
```

**Response (Error - 404 Not Found)**:
```json
{
  "status": "error",
  "message": "Certificate not found"
}
```

---

### 7. Delete Certificate

**Endpoint**: `DELETE /admin/certificate/delete/:certificate_id`

**Description**: Soft delete a certificate. The record is marked as deleted but not removed from the database.

**Authentication**: Required (JWT Token)

**Authorization**: Admin only

**Request**:
```bash
curl -X DELETE "http://localhost:3000/api/v1/admin/certificate/delete/550e8400-e29b-41d4-a716-446655440000" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (Success - 200)**:
```json
{
  "status": "success",
  "message": "Certificate deleted successfully"
}
```

**Response (Error - 404 Not Found)**:
```json
{
  "status": "error",
  "message": "Certificate not found"
}
```

---

## Response Format

### Success Response
```json
{
  "status": "success",
  "message": "Optional success message",
  "data": {} // or []
}
```

### Error Response
```json
{
  "status": "error",
  "message": "Error description"
}
```

---

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (not authenticated) |
| 403 | Forbidden (not authorized) |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## Postman Collection

You can import the following JSON to Postman for testing:

```json
{
  "info": {
    "name": "SAC Certificate Management API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:3000/api/v1"
    },
    {
      "key": "token",
      "value": "YOUR_JWT_TOKEN"
    },
    {
      "key": "certificateId",
      "value": "550e8400-e29b-41d4-a716-446655440000"
    },
    {
      "key": "userId",
      "value": "123"
    }
  ],
  "item": [
    {
      "name": "User Endpoints",
      "item": [
        {
          "name": "Get All Certificates by User ID",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "url": "{{baseUrl}}/certificate/{{userId}}"
          }
        },
        {
          "name": "Get Certificate Detail (User)",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "url": "{{baseUrl}}/certificate/user/{{certificateId}}"
          }
        }
      ]
    },
    {
      "name": "Admin Endpoints",
      "item": [
        {
          "name": "Create Certificate",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              },
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"userId\": 123,\n  \"certificateName\": \"TOEFL ITP Prediction Test\",\n  \"certificateType\": \"TOEFL ITP PREDICTION\",\n  \"certificateNumber\": \"017/SAC/TOEFL/XI/2025\",\n  \"issuedDate\": \"2025-11-15\",\n  \"testDate\": \"2025-11-10\",\n  \"validUntil\": \"2027-11-15\",\n  \"listeningScore\": 55,\n  \"structureScore\": 60,\n  \"readingScore\": 58,\n  \"overallScore\": 580,\n  \"directorName\": \"Riko Susiloputro\",\n  \"certificateUrl\": \"https://example.com/certificates/cert123.pdf\",\n  \"description\": \"TOEFL ITP Prediction Test Certificate\"\n}"
            },
            "url": "{{baseUrl}}/certificate"
          }
        },
        {
          "name": "Get All Certificates (Admin)",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/admin/certificate/list?page=1&limit=10",
              "host": ["{{baseUrl}}"],
              "path": ["admin", "certificate", "list"],
              "query": [
                {
                  "key": "page",
                  "value": "1"
                },
                {
                  "key": "limit",
                  "value": "10"
                },
                {
                  "key": "search",
                  "value": "",
                  "disabled": true
                },
                {
                  "key": "orderBy",
                  "value": "created_at",
                  "disabled": true
                },
                {
                  "key": "order",
                  "value": "desc",
                  "disabled": true
                }
              ]
            }
          }
        },
        {
          "name": "Get Certificate Detail (Admin)",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "url": "{{baseUrl}}/admin/certificate/{{certificateId}}"
          }
        },
        {
          "name": "Update Certificate",
          "request": {
            "method": "PUT",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              },
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"certificateName\": \"IELTS Academic Test\",\n  \"certificateType\": \"IELTS\",\n  \"overallScore\": 7.5\n}"
            },
            "url": "{{baseUrl}}/admin/certificate/{{certificateId}}"
          }
        },
        {
          "name": "Delete Certificate",
          "request": {
            "method": "DELETE",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "url": "{{baseUrl}}/admin/certificate/delete/{{certificateId}}"
          }
        }
      ]
    }
  ]
}
```

---

## Field Validations

### Create Certificate
- **userId**: Required, positive integer
- **certificateName**: Required, max 255 characters
- **certificateType**: Optional, max 100 characters
- **certificateNumber**: Optional, max 100 characters
- **issuedDate**: Required, valid date
- **testDate**: Optional, valid date
- **validUntil**: Optional, valid date
- **listeningScore**: Optional, integer 0-100
- **structureScore**: Optional, integer 0-100
- **readingScore**: Optional, integer 0-100
- **overallScore**: Optional, integer 0-100
- **directorName**: Optional, max 255 characters
- **certificateUrl**: Optional, valid URI, max 500 characters
- **description**: Optional, text

### Update Certificate
All fields are optional but must follow the same validation rules as create when provided.

---

## Security Notes

1. **Authentication**: All endpoints require a valid JWT token in the Authorization header
2. **Authorization**: 
   - User endpoints check ownership (users can only access their own data)
   - Admin endpoints require admin role
3. **Input Validation**: All inputs are validated using Joi schemas
4. **SQL Injection Protection**: All queries use Sequelize ORM with parameterized queries
5. **Soft Deletes**: Deleted records are not removed from the database, only marked as deleted

---

## Database Schema

```sql
CREATE TABLE `certificates` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `certificate_id` varchar(36) NOT NULL,
  `user_id` int unsigned NOT NULL,
  `certificate_name` varchar(255) NOT NULL,
  `certificate_type` varchar(100) NULL,
  `certificate_number` varchar(100) NULL,
  `issued_date` date NOT NULL,
  `test_date` date NULL,
  `valid_until` date NULL,
  `listening_score` int NULL,
  `structure_score` int NULL,
  `reading_score` int NULL,
  `overall_score` int NULL,
  `director_name` varchar(255) NULL DEFAULT 'Riko Susiloputro',
  `certificate_url` varchar(500) NULL,
  `description` text NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NULL ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `certificate_id_UNIQUE` (`certificate_id`),
  INDEX `idx_user_id` (`user_id`),
  CONSTRAINT `fk_certificates_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
);
```

---

## Need Help?

For questions or issues, please contact the development team or refer to the main API documentation.
