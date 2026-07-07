# Super Admin Module Documentation

## Overview

The Super Admin Module provides platform-wide administrative capabilities for managing multiple gym tenants, monitoring system health, and controlling platform settings. This module extends the existing gym management system with centralized administration features while maintaining tenant isolation for regular users.

## Features

### 🏢 Gym Management
- **Gym Approval Workflow**: Review and approve new gym registrations
- **Status Management**: Suspend, reactivate, or delete gym accounts
- **Platform Analytics**: View comprehensive metrics across all gyms
- **Subscription Oversight**: Monitor gym subscription status and billing

### 👥 User Management
- **Cross-Platform User View**: Access user data across all gym tenants
- **Role-based Access Control**: Manage user permissions and roles
- **Account Status Control**: Enable/disable user accounts globally
- **User Analytics**: Track user engagement and activity patterns

### 💰 Subscription Management
- **Billing Oversight**: Monitor subscription payments and billing cycles
- **Plan Management**: Create and modify subscription plans
- **Revenue Analytics**: Track platform-wide revenue and financial metrics
- **Automated Notifications**: Handle subscription renewals and alerts

### ⚙️ System Settings
- **Platform Configuration**: Manage global system settings and limits
- **Feature Toggles**: Enable/disable features across the platform
- **Security Settings**: Configure authentication and access policies
- **Notification Management**: Control system-wide notifications

### 📊 Activity Monitoring
- **Audit Trail**: Comprehensive logging of all platform activities
- **Real-time Monitoring**: Live activity feeds and alerts
- **Compliance Reporting**: Generate reports for regulatory compliance
- **Security Monitoring**: Track suspicious activities and access attempts

### 📱 Responsive Design
- **Mobile-First Interface**: Optimized for all device sizes
- **Touch-Friendly Controls**: Mobile-optimized admin interface
- **Progressive Enhancement**: Works across all browsers and devices

## Installation

### Prerequisites
- Python 3.8+
- Flask application with JWT authentication
- SQLAlchemy ORM
- React 18+
- Existing gym management system

### Backend Setup

1. **Install Dependencies** (if not already installed):
```bash
pip install flask flask-sqlalchemy flask-jwt-extended flask-cors
```

2. **Apply Database Migrations**:
```bash
# Create super admin tables
sqlite3 instance/app.db < backend/migrations/001_create_super_admin_tables.sql

# Enhance gym model
sqlite3 instance/app.db < backend/migrations/002_enhance_gym_model.sql
```

3. **Import Models and Routes**:
```python
# In your app/__init__.py
from app.super_admin_models import SystemSettings, ActivityLog, GymSubscription
from app.routes.admin import admin_bp

app.register_blueprint(admin_bp, url_prefix='/api/admin')
```

4. **Create Initial Super Admin User**:
```python
# Run this in your Flask shell
user = User(username='superadmin', email='admin@platform.com', role='super_admin')
user.set_password('secure_password')
db.session.add(user)
db.session.commit()
```

### Frontend Setup

1. **Install Dependencies**:
```bash
cd frontend
npm install recharts lucide-react
```

2. **Add Routes** to your main routing file:
```jsx
import { SuperAdminRoutes } from './routes/SuperAdminRoutes';

// In your main App.jsx or routing file
<Routes>
  {/* Existing routes */}
  <Route path="/admin/*" element={<SuperAdminRoutes />} />
</Routes>
```

3. **Update Navigation** to include admin links:
```jsx
import { RoleBasedNavLink } from './components/RoleBasedNavLink';

// In your Sidebar component
<RoleBasedNavLink 
  to="/admin/dashboard" 
  requiredRole="super_admin"
  icon={<Shield />}
>
  Super Admin
</RoleBasedNavLink>
```

## Usage

### Authentication

All Super Admin routes require authentication with the `super_admin` role:

```python
@admin_bp.route('/dashboard/analytics')
@jwt_required()
@super_admin_required
def get_dashboard_analytics():
    # Super admin only endpoint
    pass
```

### Frontend Authentication

The frontend automatically handles role-based routing:

```jsx
<ProtectedRoute requiredRole="super_admin">
  <SuperAdminDashboard />
</ProtectedRoute>
```

### Key Components

#### Dashboard Analytics
```jsx
import { SuperAdminDashboard } from '../pages/SuperAdminDashboard';

// Displays platform-wide metrics, charts, and health indicators
<SuperAdminDashboard />
```

#### Gym Management
```jsx
import { GymManagement } from '../pages/GymManagement';

// Approve, suspend, or delete gym accounts
<GymManagement />
```

#### User Management
```jsx
import { UserManagement } from '../pages/UserManagement';

// Manage users across all gym tenants
<UserManagement />
```

## API Endpoints

### Dashboard & Analytics
```
GET /api/admin/dashboard/analytics
- Returns: Platform metrics, total gyms, members, revenue
- Auth: Super Admin required
```

### Gym Management
```
GET /api/admin/gyms
- Returns: List of all gyms with status and details
- Auth: Super Admin required

POST /api/admin/gyms/{id}/approve
- Action: Approve pending gym registration
- Auth: Super Admin required

POST /api/admin/gyms/{id}/suspend
- Action: Suspend gym operations
- Auth: Super Admin required

DELETE /api/admin/gyms/{id}
- Action: Delete gym (with data preservation options)
- Auth: Super Admin required
```

### User Management
```
GET /api/admin/users
- Returns: Users across all gym tenants
- Query Params: gym_id, role, status, search
- Auth: Super Admin required

PUT /api/admin/users/{id}/status
- Action: Enable/disable user account
- Auth: Super Admin required
```

### Subscription Management
```
GET /api/admin/subscriptions
- Returns: All gym subscriptions and billing status
- Auth: Super Admin required

PUT /api/admin/subscriptions/{id}
- Action: Update subscription status or plan
- Auth: Super Admin required
```

### System Settings
```
GET /api/admin/settings
- Returns: All system settings by category
- Auth: Super Admin required

PUT /api/admin/settings/{key}
- Action: Update system setting value
- Body: { "value": "new_value" }
- Auth: Super Admin required
```

### Activity Logs
```
GET /api/admin/activity-logs
- Returns: Filtered activity logs
- Query Params: start_date, end_date, user_id, action_type
- Auth: Super Admin required
```

## Database Schema

### New Tables

#### system_settings
```sql
CREATE TABLE system_settings (
    id INTEGER PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT NOT NULL,
    category VARCHAR(50),
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### activity_logs
```sql
CREATE TABLE activity_logs (
    id INTEGER PRIMARY KEY,
    user_id INTEGER,
    gym_id INTEGER,
    action VARCHAR(100) NOT NULL,
    details TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (gym_id) REFERENCES gyms (id)
);
```

#### gym_subscriptions
```sql
CREATE TABLE gym_subscriptions (
    id INTEGER PRIMARY KEY,
    gym_id INTEGER UNIQUE NOT NULL,
    plan_name VARCHAR(50) NOT NULL,
    billing_cycle VARCHAR(20) DEFAULT 'monthly',
    status VARCHAR(20) DEFAULT 'active',
    start_date DATETIME NOT NULL,
    end_date DATETIME,
    next_billing_date DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (gym_id) REFERENCES gyms (id)
);
```

### Enhanced Tables

#### gyms (Enhanced)
```sql
-- Added columns:
ALTER TABLE gyms ADD COLUMN status VARCHAR(20) DEFAULT 'pending';
ALTER TABLE gyms ADD COLUMN approved_at DATETIME;
ALTER TABLE gyms ADD COLUMN approved_by INTEGER;
```

## Security Considerations

### Role-Based Access Control
- All Super Admin routes protected by JWT authentication
- Role verification on every request
- Tenant isolation maintained for regular users

### Activity Logging
- All administrative actions logged with user and timestamp
- IP address and user agent tracking
- Immutable audit trail for compliance

### Data Protection
- Sensitive operations require confirmation dialogs
- Data deletion includes preservation options
- Automated backups recommended before destructive operations

### Input Validation
- All inputs validated and sanitized
- SQL injection protection through parameterized queries
- XSS protection on all user-generated content

## Testing

### Backend Tests
```bash
# Run all Super Admin tests
python -m pytest backend/tests/test_super_admin_*.py -v

# Run final integration tests
python -m pytest backend/tests/test_super_admin_final_complete.py -v

# Validate complete module
python backend/tests/validate_super_admin_final_complete.py
```

### Frontend Tests
```bash
# Run all admin component tests
cd frontend
npm test src/pages/__tests__/Super*.test.jsx
npm test src/components/admin/__tests__/*.test.jsx
```

### Manual Testing Checklist

- [ ] Super Admin login and dashboard access
- [ ] Gym approval workflow (pending → approved → suspended → deleted)
- [ ] User management across multiple gym tenants
- [ ] Subscription status updates and billing management
- [ ] System settings modification and persistence
- [ ] Activity log generation and filtering
- [ ] Mobile responsive design on all admin pages
- [ ] Error handling and user feedback
- [ ] Tenant isolation (regular users cannot access admin features)

## Performance Considerations

### Database Optimization
- Indexes on frequently queried columns (user_id, gym_id, timestamp)
- Pagination for large datasets (users, logs)
- Efficient joins for cross-tenant queries

### Frontend Optimization
- Lazy loading of admin pages
- Data virtualization for large tables
- Optimized re-renders with React.memo
- Responsive image loading

### Caching Strategy
- Dashboard analytics cached for 5 minutes
- User session caching for role information
- Static assets with appropriate cache headers

## Troubleshooting

### Common Issues

**Issue**: Super Admin routes return 403 Forbidden
**Solution**: Verify JWT token includes role claim and user has super_admin role

**Issue**: Database migration errors
**Solution**: Check database permissions and existing table structure

**Issue**: Frontend admin pages not loading
**Solution**: Verify route protection and role-based rendering logic

**Issue**: Activity logs not generating
**Solution**: Check activity logging middleware is properly integrated

### Debug Mode
Enable debug logging for Super Admin operations:

```python
# Backend debugging
app.config['SUPER_ADMIN_DEBUG'] = True

# This will log all super admin operations to console
```

```jsx
// Frontend debugging
localStorage.setItem('debug', 'super_admin:*')

// This will enable console logs for admin operations
```

## Migration Guide

### From Single-Tenant to Multi-Tenant

1. **Backup existing data** before applying migrations
2. **Run database migrations** in order (001, then 002)
3. **Update existing user roles** to include super_admin where appropriate
4. **Test tenant isolation** to ensure regular users cannot access admin features
5. **Configure initial system settings** through the admin interface

### Rollback Plan

If issues arise during deployment:

1. **Disable Super Admin routes** in main application
2. **Revert database migrations** if necessary
3. **Remove admin navigation links** from regular user interface
4. **Contact support** with error logs and system state

## Support

For technical support and questions:

- **Documentation**: Full API documentation available at `/docs`
- **Issue Tracking**: Report bugs and feature requests
- **Security Issues**: Report security vulnerabilities privately

---

**Version**: 1.0.0  
**Last Updated**: January 2025  
**Compatibility**: Flask 2.0+, React 18+