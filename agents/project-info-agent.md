# TIC Project Information Agent

## Project Overview
**TIC (TSI Internal Client)** adalah aplikasi dashboard internal untuk TSI (Technical Services International) yang dibangun menggunakan teknologi modern dan scalable.

## Tech Stack
- **Framework**: Next.js 15.3.1 dengan App Router
- **Language**: TypeScript
- **Database**: PostgreSQL dengan Drizzle ORM
- **API**: tRPC untuk type-safe API calls
- **Authentication**: Better Auth
- **UI Components**: Radix UI + Tailwind CSS
- **State Management**: TanStack Query (React Query)
- **Package Manager**: pnpm

## Project Structure
```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication pages
│   ├── api/               # API routes
│   └── apps/              # Main applications
├── components/            # Reusable UI components
├── db/                    # Database schema & configuration
├── trpc/                  # tRPC setup and routers
├── views/                 # Page-specific components
├── lib/                   # Utilities and configurations
├── hooks/                 # Custom React hooks
└── types/                 # TypeScript type definitions
```

## Core Features & Applications

### Main Applications
1. **Price Simulation** - Testing pricing scenarios
2. **Perhitungan Mandays** - Project timeline & resource calculation
3. **Perhitungan Gas Karbon** - Carbon gas emissions calculator

### Audit & Certification
1. **Audit Status** - Current audit status tracking
2. **Audit Plan** (Stage 1 & 2) - Comprehensive audit planning
3. **Audit Notification** - Odoo integration for notifications
4. **Terbit Sertifikat** - Certification document generation

### Review & Documentation
1. **Review Scope** - Certification scope definition
2. **Upload Traceability** - Document management
3. **Reminder Surveillance** - Surveillance scheduling

### Finance & Administration
1. **Invoice & PnL Reports** - Financial management
2. **Proposal Status** - Proposal tracking and closing
3. **Generate Proposal** - Automated proposal generation from Odoo ERP

### Integration & Tools
1. **Panggil Aku Integration** - Multi-platform integration (Odoo, LinkedIn)

## Database Schema

### Authentication System
- **Users**: Basic user information with Better Auth
- **Sessions**: User session management

### Multi-tenancy Support
- **Tenants**: Organization/company management
- **Tenant Users**: User-tenant relationships with roles
- **Roles**: member, admin, owner

## Authentication Flow
- Login/Signup pages dengan Better Auth
- Multi-tenant support dengan role-based access
- Session management yang secure

## Development Commands
- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `db:generate` - Generate database migrations
- `db:push` - Push schema changes to database
- `db:migrate` - Run database migrations

## Key Integration Points
- **Odoo ERP TSI**: Main business system integration
- **PostgreSQL**: Primary database
- **Better Auth**: Authentication provider
- **tRPC**: Type-safe API layer

## Current Status
Proyek ini sedang dalam tahap development dengan fokus pada:
- Authentication system (✅ Complete)
- Multi-tenant architecture (✅ Complete) 
- Onboarding flow (✅ Complete)
- Core applications development (🔄 In Progress)

## Agent Usage Notes
Use this information when:
- Explaining project architecture
- Creating new features that need to integrate with existing systems
- Understanding the tech stack and conventions
- Planning database schema changes
- Setting up integrations with external systems

Last updated: July 29, 2025