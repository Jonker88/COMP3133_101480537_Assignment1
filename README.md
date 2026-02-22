# COMP3133 - Employee Management System (Assignment 1)

**Student ID:** 101480537  
**GitHub Repository:** https://github.com/Jonker88/COMP3133_101480537_Assignment1

## Description
A backend Employee Management System built with Node.js, Express, GraphQL (Apollo Server v4), and MongoDB. The system provides a complete GraphQL API for managing users (signup/login) and employees (CRUD operations) with JWT authentication, Cloudinary image uploads, and input validation.

---

## Validation Rules

### User Signup
- Username: Required, minimum 3 characters
- Email: Required, must be valid email format
- Password: Required, minimum 6 characters

### Employee
- First/Last name: Required
- Email: Required, valid format, unique
- Gender: Must be `Male`, `Female`, or `Other`
- Designation: Required
- Salary: Required, minimum 1000
- Date of joining: Required
- Department: Required

---

## Sample User for Testing
```
Username: admin
Email:    admin@example.com
Password: password123
```

---

## Error Handling
All errors are returned in GraphQL's standard error format:
```json
{
  "errors": [
    {
      "message": "Error description",
      "extensions": {
        "code": "ERROR_CODE"
      }
    }
  ]
}
```

---

## Testing
- API tested using **Postman** with GraphQL requests
- All 8 operations tested with valid and invalid inputs
- Postman collection available for import