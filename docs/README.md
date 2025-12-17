# EliteDrops E-commerce Store

A complete e-commerce platform built with both **React + Vite** and **Next.js** frameworks, featuring Supabase backend integration, Stripe payments, and CJ Dropshipping integration.

## 🚀 Projects Overview

This repository contains two fully functional e-commerce implementations:

### 1. React + Vite Version (`elitedrops-store`)
- **Framework**: React 18 + TypeScript + Vite
- **UI Library**: Radix UI + Tailwind CSS
- **State Management**: Zustand
- **Routing**: React Router DOM
- **Backend**: Supabase

### 2. Next.js Version (`elitedrops`)
- **Framework**: Next.js 14 + TypeScript
- **UI Library**: Tailwind CSS
- **State Management**: Zustand
- **Backend**: Supabase
- **Payments**: Stripe integration ready

## ✨ Features

### Core E-commerce Features
- 🛍️ **Product Catalog** - Browse products by categories
- 🔍 **Product Search & Filtering** - Find products easily
- 📱 **Responsive Design** - Mobile-first approach
- 🛒 **Shopping Cart** - Add/remove items with quantity control
- 💳 **Checkout Process** - Secure payment flow
- 👤 **User Account Management** - Profile and order history
- 🎛️ **Admin Dashboard** - Product and order management

### Technical Features
- 🔐 **Authentication** - Supabase Auth integration
- 🗄️ **Database** - PostgreSQL with Supabase
- 🎨 **Modern UI** - Beautiful, accessible components
- 📊 **Type Safety** - Full TypeScript coverage
- 🚀 **Performance** - Optimized builds and lazy loading
- 🔒 **Security** - Row Level Security (RLS) policies

## 🛠️ Technology Stack

### Frontend
- **React 18** / **Next.js 14**
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Radix UI** for accessible components
- **Lucide React** for icons
- **Zustand** for state management
- **React Router** (Vite version) / **App Router** (Next.js version)

### Backend & Services
- **Supabase** for database and authentication
- **PostgreSQL** database
- **Stripe** for payment processing
- **CJ Dropshipping** for product sourcing

### Development Tools
- **Vite** for fast development (Vite version)
- **ESLint** for code linting
- **TypeScript** for type checking
- **pnpm** for package management

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ (Node.js 20+ recommended for Supabase)
- pnpm (preferred) or npm
- Git

### Quick Start

1. **Clone and setup the project:**
   ```bash
   git clone <repository-url>
   cd elitedrops
   ```

2. **Install dependencies for both projects:**
   ```bash
   # For Vite/React version
   cd elitedrops-store
   pnpm install

   # For Next.js version
   cd ../elitedrops
   pnpm install
   ```

3. **Environment Setup:**
   
   Both projects already have environment files configured:
   - `elitedrops-store/.env` - Vite environment variables
   - `elitedrops/.env.local` - Next.js environment variables
   
   The projects are configured to work with the existing Supabase instance.

4. **Database Setup:**
   
   The database schema is ready in the `supabase/` directory:
   - `supabase/tables/` - Table definitions
   - `supabase/migrations/` - Database migrations
   - `supabase/functions/` - Edge functions

## 🚀 Development

### Run Vite/React Version
```bash
cd elitedrops-store
pnpm dev
```
Visit: `http://localhost:5173`

### Run Next.js Version
```bash
cd elitedrops
pnpm dev
```
Visit: `http://localhost:3000`

### Build for Production

#### Vite/React Version
```bash
cd elitedrops-store
pnpm build
```

#### Next.js Version
```bash
cd elitedrops
pnpm build
```

## 📁 Project Structure

```
elitedrops/
├── elitedrops-store/          # React + Vite version
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/            # Page components
│   │   ├── store/            # Zustand state management
│   │   ├── lib/              # Utilities and configurations
│   │   └── types/            # TypeScript type definitions
│   └── package.json
│
├── elitedrops/                # Next.js version
│   ├── src/
│   │   ├── app/              # Next.js App Router pages
│   │   ├── components/       # Reusable UI components
│   │   ├── lib/              # Utilities and configurations
│   │   └── store/            # Zustand state management
│   └── package.json
│
└── supabase/                 # Backend configuration
    ├── functions/            # Edge functions
    ├── migrations/           # Database migrations
    └── tables/              # Table definitions
```

## 🔧 Configuration

### Environment Variables

#### Vite/React Version (.env)
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### Next.js Version (.env.local)
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
CJ_API_KEY=your_cj_api_key
```

### Database Schema

The project includes complete database setup for:
- **Products** - Product catalog with categories, pricing, inventory
- **Customers** - User profiles and authentication
- **Orders** - Order management and tracking
- **Order Items** - Order line items
- **Cart Items** - Shopping cart functionality

### Row Level Security (RLS)

Supabase RLS policies are configured for:
- Public read access to active products
- User-specific access to personal data
- Admin access for management operations

## 🎯 Key Features Implementation

### Product Management
- Dynamic product listing with filtering
- Product detail pages with image galleries
- Inventory tracking and stock management
- Category-based organization

### Shopping Experience
- Responsive product catalog
- Advanced search and filtering
- Shopping cart with persistence
- Secure checkout process

### User Management
- User authentication via Supabase
- Profile management
- Order history tracking
- Account settings

### Admin Features
- Product CRUD operations
- Order management
- User management
- Analytics dashboard

## 🔐 Security Features

- **Authentication** - Secure user login/registration
- **Authorization** - Role-based access control
- **Data Protection** - RLS policies for data security
- **Payment Security** - Stripe integration for secure payments
- **API Security** - Protected API endpoints

## 📱 Responsive Design

- **Mobile-first** approach
- **Touch-friendly** interfaces
- **Optimized** for all screen sizes
- **Fast loading** on mobile networks

## 🚀 Performance Optimizations

- **Code splitting** for faster loading
- **Image optimization** with Next.js Image component
- **Lazy loading** for better performance
- **Efficient caching** strategies
- **Bundle optimization** for production

## 🛠️ Development Scripts

### Vite/React Version
```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm preview      # Preview production build
pnpm lint         # Run ESLint
```

### Next.js Version
```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
```

## 📈 Future Enhancements

- [ ] **Mobile App** - React Native implementation
- [ ] **Advanced Analytics** - Sales and user analytics
- [ ] **Inventory Management** - Advanced stock tracking
- [ ] **Email Notifications** - Order confirmations and updates
- [ ] **Multi-language Support** - Internationalization
- [ ] **SEO Optimization** - Enhanced search engine optimization
- [ ] **PWA Features** - Progressive Web App capabilities

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the Supabase and Next.js documentation

## 🙏 Acknowledgments

- **Supabase** for the excellent backend platform
- **Radix UI** for accessible component primitives
- **Tailwind CSS** for the utility-first CSS framework
- **Stripe** for secure payment processing
- **Vite** and **Next.js** teams for amazing development tools

---

**Built with ❤️ using modern web technologies**