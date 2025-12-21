# LuxuryHub E-commerce Platform

A complete e-commerce platform with Supabase backend and CJ Dropshipping integration.

## Features

- **Complete E-commerce Platform**: Products, orders, customers, payments
- **Admin Panel**: Full management dashboard with analytics
- **CJ Dropshipping Integration**: Automatic product sourcing and order fulfillment
- **Supabase Backend**: Real-time database, authentication, and storage
- **Modern UI**: Tailwind CSS with responsive design
- **Payment Integration**: PayPal support (expandable to other gateways)

## Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- CJ Dropshipping API account

## Quick Start

### 1. Install Dependencies

```bash
cd nextjs
npm install
```

### 2. Configure Environment Variables

Copy the example environment file and update with your credentials:

```bash
cp .env.example .env
```

Update `.env` with your actual values:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# CJdropshipping API Configuration
CJ_APP_KEY=your_cj_app_key
CJ_SECRET_KEY=your_cj_secret_key
CJ_PARTNER_ID=your_cj_partner_id

# Payment Gateways (optional)
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret

# Security
JWT_SECRET=your_jwt_secret_key
ENCRYPTION_KEY=your_encryption_key

# Admin Configuration
ADMIN_EMAIL=admin@luxuryhub.com
ADMIN_PASSWORD=secure_admin_password
```

### 3. Set Up Supabase Database

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and execute the contents of `supabase-schema.sql`
4. This will create all required tables and set up Row 4. Configure Level Security

### CJ Dropshipping

1. Get your API credentials from CJ Dropshipping dashboard
2. Update the environment variables with your CJ credentials
3. Set up webhook URL in CJ Dropshipping: `https://yourdomain.com/api/webhooks/cjdropshipping`

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

### 6. Access Admin Panel

1. Go to `/admin-control`
2. Default credentials: `admin@luxuryhub.com` / `admin123456`
3. Change password after first login

## Project Structure

```
nextjs/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── admin-control/      # Admin panel pages
│   │   ├── api/               # API routes
│   │   │   ├── products/      # Product management APIs
│   │   │   ├── orders/        # Order management APIs
│   │   │   └── webhooks/      # CJ Dropshipping webhooks
│   │   ├── products/          # Product pages
│   │   ├── cart/              # Shopping cart
│   │   └── checkout/          # Checkout process
│   ├── components/            # React components
│   │   ├── admin/             # Admin panel components
│   │   ├── ProductCard.tsx    # Product display component
│   │   └── ProductReviews.tsx # Review system
│   └── lib/                   # Utility libraries
│       ├── supabase.ts        # Supabase client
│       ├── cjdropshipping.ts  # CJ API wrapper
│       └── store-services.ts  # Business logic
├── public/                    # Static assets
└── supabase-schema.sql        # Database schema
```

## Key Features

### Admin Panel (`/admin-control`)

- **Dashboard**: Overview with key metrics
- **Product Management**: Add, edit, sync products with CJ
- **Order Management**: View, update, and sync orders with CJ
- **Customer Management**: View customer data
- **CJ Integration**: Search, import, and sync products
- **Analytics**: Sales reports and performance metrics

### CJ Dropshipping Integration

- **Product Search**: Search products from CJ catalog
- **Bulk Import**: Import multiple products at once
- **Auto Sync**: Sync inventory and prices
- **Order Forwarding**: Automatically send orders to CJ
- **Tracking Updates**: Real-time order status updates via webhooks

### API Endpoints

#### Products
- `GET /api/products` - List all products
- `POST /api/products/cj-sync` - Sync products from CJ
- `POST /api/products/cj-sync?action=import` - Import specific product

#### Orders
- `GET /api/orders/list` - List orders with filters
- `POST /api/orders/list` - Create new order
- `POST /api/orders/cj-sync` - Send order to CJ

#### Webhooks
- `POST /api/webhooks/cjdropshipping` - CJ order status updates

## Database Schema

The platform uses the following main tables:

- **customers**: User accounts and profiles
- **products**: Product catalog with CJ integration
- **orders**: Order management
- **order_items**: Order line items
- **shipping_tracking**: Order tracking information
- **categories**: Product categories
- **admin_users**: Admin user accounts
- **suppliers**: Dropshipping supplier data

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes |
| `CJ_APP_KEY` | CJ Dropshipping app key | Yes |
| `CJ_SECRET_KEY` | CJ Dropshipping secret key | Yes |
| `CJ_PARTNER_ID` | CJ Dropshipping partner ID | Yes |
| `PAYPAL_CLIENT_ID` | PayPal client ID | No |
| `PAYPAL_CLIENT_SECRET` | PayPal client secret | No |
| `JWT_SECRET` | JWT signing secret | Yes |
| `ADMIN_EMAIL` | Default admin email | No |
| `ADMIN_PASSWORD` | Default admin password | No |

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment

```bash
npm run build
npm start
```

## Support

For technical support or questions:

1. Check the documentation above
2. Review the code comments in key files
3. Test API endpoints using the admin panel
4. Monitor Supabase logs for database issues

## Security Notes

- Always use environment variables for sensitive data
- Enable Row Level Security in Supabase
- Regularly update API keys and passwords
- Use HTTPS in production
- Monitor webhook endpoints for security

## CJ Dropshipping Setup

1. **Create CJ Account**: Sign up at cjdropshipping.com
2. **Get API Credentials**: 
   - Go to API Settings
   - Generate App Key and Secret Key
   - Note your Partner ID
3. **Configure Webhooks**:
   - Set webhook URL: `https://yourdomain.com/api/webhooks/cjdropshipping`
   - Enable order status updates
   - Enable tracking number updates
4. **Test Connection**: Use admin panel to test CJ integration

## Troubleshooting

### Common Issues

1. **Database Connection**: Verify Supabase URL and keys
2. **CJ Integration**: Check API credentials and network connectivity
3. **Build Errors**: Ensure all environment variables are set
4. **Admin Login**: Verify admin user exists in database

### API Testing

Test API endpoints using curl:

```bash
# Test CJ connection
curl "https://yourdomain.com/api/products/cj-sync?action=test-connection"

# Get products
curl "https://yourdomain.com/api/products"

# Get orders
curl "https://yourdomain.com/api/orders/list"
```

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

---

**Note**: This is a production-ready e-commerce platform. Ensure proper security measures and testing before deploying to production.