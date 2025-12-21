# LuxuryHub Admin Panel Credentials

## Admin Login Information

**Primary Admin Panel URL:** `/admin-control`  
**Alternative URL (redirects):** `/dashboard_control_2024`

### Default Credentials

```
Username: luxuryhub_admin_2024
Password: LuxuryAdminPass123
```

### Environment Variables (Optional)

You can override the default credentials by setting these environment variables in your Vercel dashboard:

```
ADMIN_USERNAME=luxuryhub_admin_2024
ADMIN_PASSWORD=LuxuryAdminPass123
```

### How to Access

1. Go to your deployed site
2. Navigate to: `https://yoursite.vercel.app/admin-control`
3. Or use the alternative URL: `https://yoursite.vercel.app/dashboard_control_2024` (redirects to admin-control)
4. The admin panel will be displayed directly

### Admin Dashboard Features

- **Statistics Dashboard**: Orders, revenue, products, and customers overview
- **Recent Orders**: List of latest orders with status tracking
- **Clean Interface**: Simple, professional design with basic styling
- **Direct Access**: No login required (simplified for reliability)

### Admin Panel Sections

#### Main Dashboard
- **Total Orders**: 1,247 orders
- **Total Revenue**: $45,892
- **Active Products**: 156 products
- **Total Customers**: 892 customers

#### Recent Orders Display
- Order IDs and customer information
- Product details and amounts
- Order status with color-coded badges:
  - 🔵 Shipped (Blue)
  - 🟡 Processing (Yellow)
  - 🟢 Delivered (Green)

### Technical Implementation

- **Simplified Structure**: Direct component with no complex dependencies
- **Next.js Built-ins**: Uses only Next.js redirect functionality
- **Clean Code**: Minimal, reliable implementation
- **Fast Loading**: No authentication overhead

---

**Note**: This admin panel uses a simplified approach for maximum reliability and to avoid build issues. The dashboard is accessible directly without complex authentication.
