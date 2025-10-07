# API Integration Guide

This document provides a comprehensive guide for integrating the Lucky Draw Frontend with your backend API.

## 📡 API Configuration

### Base URL Setup

The API base URL is configured in `src/utils/api.ts`:

```typescript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
```

Set your API URL in `.env`:
```env
REACT_APP_API_URL=https://your-api-domain.com/api
```

## 🔐 Authentication

### Login Endpoint

**POST** `/auth/login`

Request:
```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "user": {
    "id": "1",
    "email": "admin@example.com",
    "name": "Admin User",
    "role": "SUPER_ADMIN",
    "twoFactorEnabled": false,
    "createdAt": "2025-01-01T00:00:00Z",
    "lastLogin": "2025-10-01T10:00:00Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Logout Endpoint

**POST** `/auth/logout`
tf
Headers:
```
Authorization: Bearer {token}
```

## 🏆 Contest Endpoints

### Get All Contests

**GET** `/contests`

Query Parameters:
- `status` (optional): Filter by status (DRAFT, UPCOMING, ONGOING, COMPLETED, CANCELLED)
- `search` (optional): Search by name or theme
- `page` (optional): Page number for pagination
- `limit` (optional): Items per page

Response:
```json
{
  "contests": [
    {
      "id": "1",
      "name": "Summer Festival Giveaway",
      "theme": "Summer",
      "description": "Win amazing prizes",
      "startDate": "2025-09-15",
      "endDate": "2025-10-15",
      "status": "ONGOING",
      "prizes": [
        {
          "id": "1",
          "name": "iPhone 15 Pro",
          "value": 120000,
          "quantity": 1
        }
      ],
      "entryRules": "One entry per person",
      "participationMethod": ["QR", "WHATSAPP"],
      "totalParticipants": 342,
      "totalEntries": 342,
      "createdBy": "1",
      "createdAt": "2025-09-01",
      "updatedAt": "2025-09-01"
    }
  ],
  "total": 24,
  "page": 1,
  "totalPages": 3
}
```

### Create Contest

**POST** `/contests`

Request:
```json
{
  "name": "New Contest",
  "theme": "Festival",
  "description": "Description here",
  "startDate": "2025-11-01",
  "endDate": "2025-11-30",
  "status": "DRAFT",
  "prizes": [
    {
      "name": "Prize Name",
      "value": 50000,
      "quantity": 1
    }
  ],
  "entryRules": "Rules here",
  "participationMethod": ["QR", "WHATSAPP"]
}
```

### Update Contest

**PUT** `/contests/:id`

Request: Same as Create Contest

### Delete Contest

**DELETE** `/contests/:id`

## 👥 Participant Endpoints

### Get All Participants

**GET** `/participants`

Query Parameters:
- `contestId` (optional): Filter by contest
- `isValid` (optional): Filter by validation status
- `search` (optional): Search by name, email, or phone
- `page`, `limit`: Pagination

Response:
```json
{
  "participants": [
    {
      "id": "1",
      "name": "Rajesh Kumar",
      "email": "rajesh@example.com",
      "phone": "+91 98765 43210",
      "contestId": "1",
      "entryDate": "2025-09-20T10:30:00Z",
      "entryMethod": "QR",
      "ipAddress": "192.168.1.1",
      "deviceId": "device-001",
      "isDuplicate": false,
      "isValid": true
    }
  ],
  "total": 1847,
  "page": 1,
  "totalPages": 19
}
```

### Import Participants

**POST** `/participants/import`

Content-Type: `multipart/form-data`

Form Data:
- `file`: CSV or Excel file
- `contestId`: Contest ID

### Export Participants

**GET** `/participants/export`

Query Parameters:
- `contestId` (optional)
- `format`: csv or excel

Response: File download

### Remove Duplicates

**POST** `/participants/remove-duplicates`

Request:
```json
{
  "contestId": "1"
}
```

## 🎲 Lucky Draw Endpoints

### Execute Draw

**POST** `/draws/execute`

Request:
```json
{
  "contestId": "1",
  "prizeId": "1",
  "winnersCount": 3,
  "drawType": "MANUAL"
}
```

Response:
```json
{
  "draw": {
    "id": "1",
    "contestId": "1",
    "executedBy": "1",
    "executedAt": "2025-09-25T15:30:00Z",
    "drawType": "MANUAL",
    "winnersCount": 3,
    "winners": [
      {
        "id": "1",
        "participantId": "1",
        "participant": { /* participant details */ },
        "prize": { /* prize details */ },
        "wonAt": "2025-09-25T15:30:00Z",
        "prizeStatus": "PENDING"
      }
    ]
  }
}
```

### Get Draw History

**GET** `/draws`

Query Parameters:
- `contestId` (optional)

## 🏅 Winner Endpoints

### Get All Winners

**GET** `/winners`

Query Parameters:
- `contestId` (optional)
- `prizeStatus` (optional): PENDING, NOTIFIED, CLAIMED, DISPATCHED, DELIVERED
- `search` (optional)

Response:
```json
{
  "winners": [
    {
      "id": "1",
      "participantId": "1",
      "participant": { /* participant details */ },
      "contestId": "1",
      "contest": { /* contest details */ },
      "prize": { /* prize details */ },
      "wonAt": "2025-09-25T15:30:00Z",
      "prizeStatus": "PENDING",
      "notificationSent": false
    }
  ]
}
```

### Update Winner Status

**PATCH** `/winners/:id/status`

Request:
```json
{
  "prizeStatus": "DISPATCHED"
}
```

### Send Notification

**POST** `/winners/:id/notify`

Response:
```json
{
  "success": true,
  "message": "Notification sent successfully"
}
```

### Bulk Notify

**POST** `/winners/notify-all`

Request:
```json
{
  "contestId": "1"
}
```

## 💬 Communication Endpoints

### Get Messages

**GET** `/messages`

Response:
```json
{
  "messages": [
    {
      "id": "1",
      "type": "WELCOME",
      "recipients": ["all"],
      "subject": "Welcome",
      "content": "Thank you for participating",
      "sentAt": "2025-09-15T10:00:00Z",
      "sentBy": "Admin",
      "status": "SENT"
    }
  ]
}
```

### Send Message

**POST** `/messages`

Request:
```json
{
  "type": "CUSTOM",
  "recipients": ["all"],
  "subject": "Subject",
  "content": "Message content"
}
```

## 📊 Analytics Endpoints

### Get Dashboard Stats

**GET** `/analytics/dashboard`

Response:
```json
{
  "totalContests": 24,
  "activeContests": 5,
  "totalParticipants": 1847,
  "totalWinners": 156,
  "pendingDraws": 3,
  "pendingPrizes": 12
}
```

### Get Participation Trend

**GET** `/analytics/participation-trend`

Query Parameters:
- `period`: daily, weekly, monthly
- `startDate`, `endDate`

Response:
```json
{
  "trend": [
    { "date": "2025-09-25", "count": 120 },
    { "date": "2025-09-26", "count": 150 }
  ]
}
```

### Get Contest Performance

**GET** `/analytics/contest-performance`

Response:
```json
{
  "performance": [
    {
      "contestId": "1",
      "contestName": "Summer Festival",
      "participants": 342,
      "entries": 342,
      "engagementRate": 94
    }
  ]
}
```

## 👤 User Management Endpoints

### Get All Users

**GET** `/users`

Response:
```json
{
  "users": [
    {
      "id": "1",
      "email": "admin@example.com",
      "name": "Admin User",
      "role": "SUPER_ADMIN",
      "twoFactorEnabled": true,
      "createdAt": "2025-01-01T00:00:00Z",
      "lastLogin": "2025-10-01T10:00:00Z"
    }
  ]
}
```

### Create User

**POST** `/users`

Request:
```json
{
  "email": "newuser@example.com",
  "name": "New User",
  "role": "MODERATOR",
  "password": "securepassword",
  "twoFactorEnabled": false
}
```

### Update User

**PUT** `/users/:id`

### Delete User

**DELETE** `/users/:id`

### Get Activity Logs

**GET** `/users/activity-logs`

Response:
```json
{
  "logs": [
    {
      "id": "1",
      "userId": "1",
      "userName": "Admin User",
      "action": "Created Contest",
      "resource": "Contest",
      "resourceId": "1",
      "timestamp": "2025-09-25T10:00:00Z",
      "ipAddress": "192.168.1.1"
    }
  ]
}
```

## ⚙️ Settings Endpoints

### Get Settings

**GET** `/settings`

Response:
```json
{
  "general": {
    "siteName": "Lucky Draw",
    "siteUrl": "https://example.com",
    "timezone": "Asia/Kolkata",
    "language": "en"
  },
  "notifications": { /* ... */ },
  "security": { /* ... */ },
  "email": { /* ... */ }
}
```

### Update Settings

**PUT** `/settings`

Request:
```json
{
  "general": { /* settings */ },
  "notifications": { /* settings */ }
}
```

## 🔒 Authentication Headers

All authenticated requests must include:

```
Authorization: Bearer {token}
```

The frontend automatically adds this header using Axios interceptors.

## ❌ Error Responses

Standard error format:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "issue": "Invalid email format"
    }
  }
}
```

HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `500` - Internal Server Error

## 🔄 Implementing API Calls

### Example: Fetching Contests

```typescript
// In your component or service
import { apiService } from '../utils/api';
import { Contest } from '../types';

const fetchContests = async () => {
  try {
    const response = await apiService.get<{ contests: Contest[] }>('/contests');
    return response.contests;
  } catch (error) {
    console.error('Error fetching contests:', error);
    throw error;
  }
};
```

### Example: Creating a Contest

```typescript
const createContest = async (contestData: Partial<Contest>) => {
  try {
    const response = await apiService.post<Contest>('/contests', contestData);
    return response;
  } catch (error) {
    console.error('Error creating contest:', error);
    throw error;
  }
};
```

## 🧪 Testing API Integration

### Using Mock Data

The current implementation uses mock data. To switch to real API:

1. Update the API calls in each component
2. Replace mock data with API responses
3. Handle loading and error states
4. Update the API base URL in `.env`

### Example Migration

Before (Mock):
```typescript
const [contests, setContests] = useState<Contest[]>(mockContests);
```

After (API):
```typescript
const [contests, setContests] = useState<Contest[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchData = async () => {
    try {
      const data = await apiService.get<{ contests: Contest[] }>('/contests');
      setContests(data.contests);
    } catch (error) {
      toast.error('Failed to fetch contests');
    } finally {
      setLoading(false);
    }
  };
  fetchData();
}, []);
```

## 📝 Notes

- All dates should be in ISO 8601 format
- All monetary values are in the smallest currency unit (e.g., paise for INR)
- Pagination uses 1-based indexing
- File uploads use multipart/form-data
- All responses include appropriate HTTP status codes

---

**Need help?** Check the backend API documentation or contact the backend team.
