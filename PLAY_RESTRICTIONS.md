# Play Restrictions and Visibility Scope Feature

This document describes the new Play Restrictions and Visibility Scope features added to FUXA.

## Overview

The Play Restrictions feature allows administrators to control which views users can access when they enter the FUXA website. This is useful for:
- Restricting certain views to specific users
- Controlling access based on user roles
- Creating custom dashboards for different user groups

## Database Schema

### 1. Const Parameters Table

The `constParameters` table stores constant parameters with visibility scope control.

```sql
CREATE TABLE constParameters (
  name TEXT PRIMARY KEY,
  value TEXT,
  visibility_scope TEXT,  -- 'global', 'role', 'user', 'owner'
  creator TEXT,
  created_at INTEGER,
  updated_at INTEGER
);
```

**Visibility Scopes:**
- `global`: Visible to all users
- `role`: Visible only to specific roles
- `user`: Visible only to specific users
- `owner`: Visible only to the creator

### 2. Play Restrictions Table

The `playRestrictions` table controls which users/roles can access specific views.

```sql
CREATE TABLE playRestrictions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT,              -- 'user' or 'role'
  view_id TEXT,           -- View ID to restrict
  user_id TEXT,           -- User ID (when type='user')
  role_id TEXT,           -- Role ID (when type='role')
  creator TEXT,           -- Who created this restriction
  created_at INTEGER,     -- Timestamp when created
  updated_at INTEGER      -- Timestamp when last updated
);
```

### 3. Views Table Update

The `views` table has been updated to include visibility scope:

```sql
CREATE TABLE views (
  name TEXT PRIMARY KEY,
  value TEXT,
  visibility_scope TEXT   -- NEW: Controls view visibility
);
```

**Visibility Scope Types:**
- `global` (default): Visible to all users
- `role`: Visible to specific roles (use with playRestrictions table)
- `user`: Visible to specific users (use with playRestrictions table)
- `owner`: Visible only to the creator

## API Endpoints

### 📚 Swagger Documentation

**Interactive API documentation is now available!** After starting the server, visit:

```
http://localhost:1881/api-docs
```

Swagger UI provides:
- ✅ Interactive API testing interface
- ✅ Complete request/response examples
- ✅ Online authentication and testing
- ✅ Code generation capabilities
- ✅ OpenAPI 3.0 JSON export

For detailed usage instructions, see: [SWAGGER_GUIDE.md](./SWAGGER_GUIDE.md)

### Play Restrictions API

All endpoints require admin authentication.

#### 1. GET Play Restrictions

```http
GET /api/playrestrictions
GET /api/playrestrictions?viewId=v_12345
```

**Headers:**
- `x-access-token`: JWT token (required)

**Query Parameters:**
- `viewId` (optional): Filter restrictions by view ID

**Response:**
```json
[
  {
    "id": 1,
    "type": "user",
    "view_id": "v_12345",
    "user_id": "john",
    "role_id": null,
    "creator": "admin",
    "created_at": 1234567890000,
    "updated_at": 1234567890000
  },
  {
    "id": 2,
    "type": "role",
    "view_id": "v_67890",
    "user_id": null,
    "role_id": "operators",
    "creator": "admin",
    "created_at": 1234567890000,
    "updated_at": 1234567890000
  }
]
```

#### 2. POST Play Restriction

```http
POST /api/playrestrictions
```

**Headers:**
- `x-access-token`: JWT token (required)
- `Content-Type`: application/json

**Request Body:**
```json
{
  "type": "user",
  "view_id": "v_12345",
  "user_id": "john",
  "role_id": null
}
```

**Response:**
```json
{
  "id": 1
}
```

#### 3. DELETE Play Restriction

```http
DELETE /api/playrestrictions/:id
```

**Headers:**
- `x-access-token`: JWT token (required)

**Response:**
```json
{
  "success": true
}
```

#### 4. GET Allowed Views for Current User

```http
GET /api/playrestrictions/allowed-views
```

**Headers:**
- `x-access-token`: JWT token (required)

**Response:**
```json
{
  "allowed": true,
  "views": ["v_12345", "v_67890", "v_11111"]
}
```

## Configuration

### Environment Variables

Create a `.env` file in the server directory:

```bash
# Enable play restriction check
PLAY_RESTRICTION_ENABLED=true
```

Or configure in `server/settings.js`:

```javascript
module.exports = {
  // ... other settings

  playRestrictionEnabled: true,
}
```

**Default:** `false` (restrictions are not checked)

## How It Works

### 1. When Play Restrictions are Disabled

If `playRestrictionEnabled` is `false` or not set:
- All users can access all views
- No restrictions are checked
- The system behaves as before

### 2. When Play Restrictions are Enabled

If `playRestrictionEnabled` is `true`:

1. When a user logs in and requests views, the system checks the `playRestrictions` table
2. Views are filtered based on:
   - **User-based restrictions**: If there's a restriction with `type='user'` and matching `user_id`
   - **Role-based restrictions**: If there's a restriction with `type='role'` and the user has that role
3. Views without any restrictions are accessible to all users
4. The frontend receives only the views the user is allowed to access

### 3. Restriction Logic

```javascript
// For a view to be accessible:
1. If NO restrictions exist for that view → Accessible to ALL users
2. If restrictions exist for that view:
   - User has a user-specific restriction (type='user') → Accessible
   - User has a role that matches a role restriction (type='role') → Accessible
   - Otherwise → NOT accessible
```

## Usage Examples

### Example 1: Restrict a view to a specific user

```javascript
// POST /api/playrestrictions
{
  "type": "user",
  "view_id": "v_dashboard_admin",
  "user_id": "admin_john",
  "role_id": null
}
```

Result: Only user "admin_john" can access the "v_dashboard_admin" view.

### Example 2: Restrict a view to a role

```javascript
// POST /api/playrestrictions
{
  "type": "role",
  "view_id": "v_operators_panel",
  "user_id": null,
  "role_id": "operators"
}
```

Result: All users with the "operators" role can access "v_operators_panel".

### Example 3: Multiple restrictions on same view

```javascript
// Restriction 1
{
  "type": "user",
  "view_id": "v_critical_systems",
  "user_id": "admin_john",
  "role_id": null
}

// Restriction 2
{
  "type": "role",
  "view_id": "v_critical_systems",
  "user_id": null,
  "role_id": "senior_operators"
}
```

Result: The view "v_critical_systems" is accessible by:
- User "admin_john"
- Any user with the "senior_operators" role

### Example 4: Get allowed views for current user

When a user logs in, call:

```http
GET /api/playrestrictions/allowed-views
```

This returns all view IDs the user can access, which can be used to filter navigation menus.

## Frontend Integration (TODO)

The frontend UI needs to be updated to support:

1. **View Management UI**
   - Add visibility scope selector when creating/editing views
   - Options: Global, Role, User, Owner

2. **Play Restrictions Management UI**
   - Admin panel to create/edit/delete play restrictions
   - Table showing all restrictions with view, type, user/role
   - Form to add new restrictions with dropdowns for:
     - View selection
     - Type (User/Role)
     - User or Role selection based on type

3. **User Dashboard**
   - Filter navigation menu based on allowed views
   - Hide views the user cannot access
   - Show appropriate error message if user tries to access restricted view

## Security Considerations

1. **Admin Only**: All play restriction management endpoints require admin authentication
2. **Token Required**: All endpoints require valid JWT token
3. **Default Open**: By default, play restrictions are disabled for backward compatibility
4. **Explicit Enable**: Must explicitly set `PLAY_RESTRICTION_ENABLED=true` to activate

## Testing

### 1. Enable the Feature

```bash
# In .env file
PLAY_RESTRICTION_ENABLED=true
```

### 2. Create Test Restrictions

```bash
# Create restriction for user
curl -X POST http://localhost:1881/api/playrestrictions \
  -H "x-access-token: YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "user",
    "view_id": "v_test",
    "user_id": "testuser"
  }'
```

### 3. Test Allowed Views

```bash
# Get allowed views for current user
curl http://localhost:1881/api/playrestrictions/allowed-views \
  -H "x-access-token: YOUR_USER_TOKEN"
```

### 4. Verify Restrictions

1. Login as a user without restrictions → Should see all unrestricted views
2. Login as a user with restrictions → Should see only allowed views
3. Disable feature → All users should see all views again

## Migration Notes

- **Backward Compatible**: Existing FUXA installations will continue to work without any changes
- **No Data Loss**: The new tables are created automatically on first run
- **Existing Views**: All existing views remain accessible to all users by default
- **Opt-in Feature**: Must explicitly enable `playRestrictionEnabled` to use restrictions

## Future Enhancements

Potential improvements for future versions:

1. **View Groups**: Group multiple views for easier restriction management
2. **Time-based Restrictions**: Restrict access based on time/date
3. **Audit Log**: Track who accessed which views when
4. **Restriction Inheritance**: Parent-child view relationships with inherited restrictions
5. **Export/Import**: Export and import restriction configurations
