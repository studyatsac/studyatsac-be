# Frontend Certificate Integration Guide

## Overview
This document explains how to integrate the certificate API endpoints into your frontend application.

## 🔑 Key Points

1. **All API responses use `snake_case`** - The backend now returns all fields in snake_case format
2. **Use `/certificate/me` endpoint** - No need to pass user IDs, authentication handled via session
3. **Pagination is optional** - Can retrieve all certificates or paginated results

---

## API Endpoints

### Get User Certificates
```
GET /v1/certificate/me
GET /v1/certificate/me?page=1&limit=10
```

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "certificate_id": "ad92ae7d-b590-4fc9-99eb-8864a7b172bb",
      "user_id": 4105,
      "certificate_name": "TOEFL Certificate",
      "certificate_type": "TOEFL ITP PREDICTION",
      "certificate_number": "017/SAC/TOEFL/XI/2025",
      "issued_date": "2025-12-03",
      "test_date": "2025-12-03",
      "valid_until": "2026-12-03",
      "listening_score": 100,
      "structure_score": 100,
      "reading_score": 100,
      "overall_score": 400,
      "director_name": "Riko Susiloputro",
      "certificate_url": "https://example.com/cert.pdf",
      "description": "TOEFL ITP Prediction Test",
      "created_at": "2025-12-21T20:24:10.000Z",
      "updated_at": "2025-12-21T20:24:10.000Z",
      "deleted_at": null,
      "user": {
        "id": 4105,
        "uuid": "9064f209-2adf-43ef-a16f-6ef779841750",
        "full_name": "Muhammad Ade Dzakwan",
        "email": "user@example.com",
        "photo_url": null,
        "institution_name": "University Name"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

---

## Frontend Implementation

### React Example

```jsx
import { useState, useEffect } from 'react';

function CertificateList() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async (page = 1, limit = 9) => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://api.studyatsac.com/v1/certificate/me?page=${page}&limit=${limit}`,
        {
          headers: {
            'Authorization': `Bearer ${yourAuthToken}`
          }
        }
      );
      
      const data = await response.json();
      
      if (data.status === 'success') {
        setCertificates(data.data);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching certificates:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="certificate-list">
      <h2>Sertifikat Saya</h2>
      
      {loading ? (
        <p>Loading...</p>
      ) : certificates.length === 0 ? (
        <p>Belum ada sertifikat</p>
      ) : (
        <>
          <div className="certificates-grid">
            {certificates.map((cert) => (
              <div key={cert.certificate_id} className="certificate-card">
                <h3>{cert.certificate_name}</h3>
                <p>Nama Sertifikat: {cert.certificate_name}</p>
                <p>Tanggal Terbit: {new Date(cert.issued_date).toLocaleDateString('id-ID')}</p>
                <p>Tipe: {cert.certificate_type || '-'}</p>
                <p>Nomor: {cert.certificate_number || '-'}</p>
                <p>Skor: {cert.overall_score || '-'}</p>
                
                <button onClick={() => window.open(cert.certificate_url, '_blank')}>
                  Lihat Sertifikat
                </button>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination && (
            <div className="pagination">
              <button 
                disabled={!pagination.hasPreviousPage}
                onClick={() => fetchCertificates(pagination.page - 1)}
              >
                Previous
              </button>
              <span>Page {pagination.page} of {pagination.totalPages}</span>
              <button 
                disabled={!pagination.hasNextPage}
                onClick={() => fetchCertificates(pagination.page + 1)}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default CertificateList;
```

---

## Field Reference

| Frontend Display | API Field | Type | Format |
|-----------------|-----------|------|--------|
| Nama Sertifikat | `certificate_name` | string | - |
| Tanggal Terbit | `issued_date` | string | YYYY-MM-DD |
| Tanggal Tes | `test_date` | string | YYYY-MM-DD |
| Berlaku Hingga | `valid_until` | string | YYYY-MM-DD |
| Tipe | `certificate_type` | string | - |
| Nomor | `certificate_number` | string | - |
| Skor Listening | `listening_score` | number | 0-677 |
| Skor Structure | `structure_score` | number | 0-677 |
| Skor Reading | `reading_score` | number | 0-677 |
| Skor Total | `overall_score` | number | 0-677 |
| URL Sertifikat | `certificate_url` | string | URL |

---

## Important Notes

✅ **DO:**
- Use `certificate_id` (UUID) for identifying certificates
- Format dates using `new Date(cert.issued_date).toLocaleDateString()`
- Check for null/undefined before displaying optional fields
- Use snake_case when accessing API response fields

❌ **DON'T:**
- Use camelCase field names (e.g., `certificateName`) - they won't exist
- Try to construct `/certificate/user/:userid` URLs - use `/certificate/me` instead
- Forget to handle pagination if you're displaying large lists

---

**Last Updated:** 2025-12-22  
**API Version:** v1
