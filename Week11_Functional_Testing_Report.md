# API Testing Report

## Smart Carbon Tracker

### Objective

To verify that all backend API endpoints are functioning correctly.

---

# Tested APIs

| Endpoint                       | Method | Purpose                              | Status |
| ------------------------------ | ------ | ------------------------------------ | ------ |
| /api/analytics/total           | GET    | Fetch total carbon emission          | Pass   |
| /api/analytics/category        | GET    | Fetch category-wise emissions        | Pass   |
| /api/analytics/predict         | GET    | Fetch predicted footprint            | Pass   |
| /api/analytics/recommendations | GET    | Fetch sustainability recommendations | Pass   |
| /api/users/register            | POST   | Register new user                    | Pass   |
| /api/users/login               | POST   | Authenticate user                    | Pass   |

---

# Sample API Responses

## Total Emission

```json
{
  "total": "202.00",
  "unit": "kg CO2"
}
```
