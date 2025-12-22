# Frontend Integration Guide: Certificate API Updates

## Summary

The backend certificate API has been migrated to use `exam_id` instead of `certificate_name`. The frontend must be updated to send `exam_id` and handle the new response format.

## Required Frontend Changes

### 1. Certificate Creation Form

**Before:**
```javascript
const payload = {
  user_id: userId,
  certificate_name: "TOEFL ITP Prediction Test",  // ❌ OLD
  certificate_type: "TOEFL ITP PREDICTION",
  // ... other fields
};
```

**After:**
```javascript
const payload = {
  user_id: userId,
  exam_id: selectedExamId,  // ✅ NEW - Must be a valid exam ID
  certificate_type: "TOEFL ITP PREDICTION",  // Optional, backend can auto-populate
  // ... other fields
};
```

**Requirements:**
- Replace certificate name text input with exam selector/autocomplete
- Fetch available exams from `GET /admin/exams` endpoint
- Display format: `"${exam.title} - ${exam.exam_type}"`
- Send `exam_id` (integer) instead of `certificate_name` (string)

### 2. API Response Format Changes

All certificate endpoints now return `exam` object and exam_id:

**Example Response:**
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "certificate_id": "abc-123-def",
    "user_id": 4105,
    "exam_id": 123,  // ✅ NEW
    "exam": {  // ✅ NEW - Nested exam data
      "id": 123,
      "uuid": "exam-uuid",
      "title": "TOEFL ITP Prediction Test",
      "category_id": 1,
      "additional_information": {...}
    },
    "certificate_type": "TOEFL ITP PREDICTION",
    "certificate_number": "001/SAC/2025",
    "issued_date": "2025-01-15",
    // ... other fields
    "user": {
      "id": 4105,
      "uuid": "user-uuid",
      "full_name": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

### 3. Display Certificate Name in UI

Since `certificate_name` no longer exists, use the exam title from the nested exam object:

**Before:**
```javascript
<p>Certificate: {certificate.certificate_name}</p>
```

**After:**
```javascript
<p>Certificate: {certificate.exam?.title || 'N/A'}</p>
// Or
<p>Exam: {certificate.exam?.title}</p>
<p>Type: {certificate.certificate_type}</p>
```

### 4. Update TypeScript Interfaces (if applicable)

```typescript
interface Certificate {
  id: number;
  certificate_id: string;
  user_id: number;
  exam_id: number;  // ✅ NEW
  exam?: {  // ✅ NEW
    id: number;
    uuid: string;
    title: string;
    category_id: number;
    additional_information?: any;
  };
  // Remove: certificate_name: string;  // ❌ REMOVED
  certificate_type?: string;
  certificate_number?: string;
  // ... other fields
}
```

### 5. Form Validation Updates

```javascript
// Before
const schema = {
  certificate_name: Yup.string().required('Certificate name is required'),
};

// After
const schema = {
  exam_id: Yup.number().required('Exam selection is required')
    .positive('Please select a valid exam'),
};
```

### 6. Exam Selector Component Example

```jsx
import { useState, useEffect } from 'react';

function CertificateForm() {
  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState(null);

  // Fetch available exams
  useEffect(() => {
    fetch('/admin/exams')
      .then(res => res.json())
      .then(data => setExams(data.data || []));
  }, []);

  const handleSubmit = () => {
    const payload = {
      user_id: userId,
      exam_id: selectedExamId,  // Required
      certificate_type: certificateType,  // Optional
      // ... other fields
    };

    fetch('/certificate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>Select Exam:</label>
      <select 
        value={selectedExamId} 
        onChange={(e) => setSelectedExamId(parseInt(e.target.value))}
        required
      >
        <option value="">-- Select Exam --</option>
        {exams.map(exam => (
          <option key={exam.id} value={exam.id}>
            {exam.title} - {exam.exam_type || exam.additional_information?.type}
          </option>
        ))}
      </select>
      {/* Other form fields */}
      <button type="submit">Create Certificate</button>
    </form>
  );
}
```

## API Endpoints Summary

All endpoints now return exam data:

| Endpoint | Method | Changes |
|----------|--------|---------|
| `/certificate` | POST | Requires `exam_id` instead of `certificate_name` |
| `/certificate/me` | GET | Returns `exam_id` and nested `exam` object |
| `/certificate/user/:id` | GET | Returns `exam_id` and nested `exam` object |
| `/admin/certificate/list` | GET | Returns `exam_id` and nested `exam` object for each certificate |
| `/admin/certificate/:id` | GET | Returns `exam_id` and nested `exam` object |
| `/admin/certificate/:id` | PUT | Accepts `exam_id` instead of `certificate_name` |

## Error Handling

Handle new error cases:

```javascript
try {
  const response = await createCertificate(payload);
} catch (error) {
  if (error.message === 'Exam not found') {
    // Selected exam doesn't exist or was deleted
    alert('The selected exam is no longer available');
  } else if (error.message.includes('Exam ID is required')) {
    // Validation error - exam_id not provided
    alert('Please select an exam');
  }
}
```

## Testing Checklist

After frontend updates:

- [ ] Certificate creation form shows exam selector (not text input)
- [ ] Exam selector fetches and displays available exams
- [ ] Form submits with `exam_id` (integer)
- [ ] Certificate list displays exam name from `exam.title`
- [ ] Certificate detail page shows exam information
- [ ] Edit certificate form allows changing exam selection
- [ ] Error handling works when invalid exam_id is selected
- [ ] No references to `certificate_name` remain in code

## Migration Notes

> [!IMPORTANT]
> The backend automatically validates that the provided `exam_id` exists in the database. If you send an invalid `exam_id`, you will receive a `404` error with message "Exam not found".

> [!TIP]
> The `certificate_type` field is now optional. If you don't provide it, you can implement backend logic to auto-populate it from the exam's metadata.

## Questions?

If you encounter issues:
1. Verify the exam selector is fetching data from `/admin/exams`
2. Check that `exam_id` is sent as a number, not a string
3. Ensure API responses include the `exam` nested object
4. Check browser console for validation errors

---

**Status:** Backend migration complete ✅  
**Next Steps:** Update frontend to use `exam_id` and test integration
