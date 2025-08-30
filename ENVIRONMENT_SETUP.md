# Environment Setup for Authentication

## Problem
The application was getting a 500 Internal Server Error when trying to authenticate because it was connecting to the production backend (`https://procure.activaccer.ai`) instead of the local development backend.

## Solution
The application now automatically detects the environment and uses the appropriate API endpoint:

### Development Environment (localhost)
- **Frontend**: `http://localhost:8081`
- **Backend**: `http://localhost:8000`
- **API Base URL**: `http://localhost:8000/api/v1`

### Production Environment (deployed)
- **Frontend**: `https://procure.activaccer.ai` (or your domain)
- **Backend**: `https://procure.activaccer.ai`
- **API Base URL**: `https://procure.activaccer.ai/api/v1`

## How It Works

### Automatic Environment Detection
The application detects the environment based on the hostname:

```typescript
const getApiBaseUrl = () => {
  // Check if we're in production (deployed environment)
  if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    // Production environment - use the production API
    return 'https://procure.activaccer.ai/api/v1';
  } else {
    // Development environment - use localhost
    return 'http://localhost:8000/api/v1';
  }
};
```

### Files Updated
1. **`src/contexts/AuthContext.tsx`** - Authentication logic
2. **`src/lib/api.ts`** - API service calls

## Setup Instructions

### For Development
1. **Start the backend server**:
   ```bash
   cd route-craft-58-backend
   source venv/bin/activate
   python main.py
   ```

2. **Start the frontend**:
   ```bash
   cd route-craft-58
   npm run dev
   ```

3. **Access the application**:
   - URL: `http://localhost:8081`
   - Login: `admin@company.com` / `admin@company.com`

### For Production
1. **Ensure the production backend has authentication endpoints**:
   - `/api/v1/auth/login`
   - `/api/v1/auth/register`
   - `/api/v1/auth/me`
   - `/api/v1/auth/logout`

2. **Add the admin user to production database**:
   ```sql
   INSERT INTO users (email, first_name, last_name, role, company_name, status, password_hash) 
   VALUES ('admin@company.com', 'Admin', 'User', 'admin', 'Company', 'active', '$2b$12$IYJ0ypeF2rK/A8QM90HhOeWqwcCMAb7gK7hIY.Hz.kTXSLyZRvxYG');
   ```

3. **Deploy the frontend** to your production domain

## Troubleshooting

### 500 Internal Server Error
**Cause**: Production backend doesn't have authentication endpoints or database issues.

**Solutions**:
1. Check if the production backend is running
2. Verify authentication endpoints exist in production
3. Ensure the admin user exists in production database
4. Check production backend logs for specific errors

### CORS Issues
**Cause**: Production backend doesn't allow requests from frontend domain.

**Solutions**:
1. Update CORS configuration in production backend
2. Add frontend domain to allowed origins

### Database Connection Issues
**Cause**: Production database is not accessible or credentials are incorrect.

**Solutions**:
1. Verify database connection settings
2. Check database credentials
3. Ensure database is running and accessible

## Testing

### Development Testing
```bash
# Test local authentication
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin@company.com&password=admin@company.com"
```

### Production Testing
```bash
# Test production authentication
curl -X POST "https://procure.activaccer.ai/api/v1/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin@company.com&password=admin@company.com"
```

## Security Notes
- Passwords are hashed using bcrypt
- JWT tokens are used for session management
- HTTPS is required in production
- CORS is properly configured for security
- Error messages don't expose sensitive information

The application will now automatically use the correct backend URL based on the environment! 