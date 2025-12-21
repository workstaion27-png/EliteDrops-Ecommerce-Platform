# LuxuryHub Admin Panel Credentials

## Admin Login Information

**Admin Panel URL:** `/dashboard_control_2024`

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
2. Navigate to: `https://yoursite.vercel.app/dashboard_control_2024`
3. Enter the credentials above
4. You'll be redirected to the admin dashboard

### Admin Dashboard Features

- **Overview**: Statistics dashboard with orders, revenue, products, and customers
- **Recent Orders**: List of latest orders with status tracking
- **Clean Interface**: Simple, professional design with inline SVG icons
- **Secure Authentication**: Session-based login with localStorage

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

### Security Features

- Session-based authentication
- Automatic redirect to login if not authenticated
- Logout functionality with session cleanup
- Client-side session validation

### Technical Implementation

- **No External Dependencies**: Uses inline SVG icons instead of external libraries
- **React Hooks**: useState and useRouter for state management
- **Local Storage**: Session persistence
- **Clean Code**: Minimal, readable implementation

---

**Note**: This admin panel uses simplified authentication for reliability. Credentials are hardcoded in the source code for development purposes.
