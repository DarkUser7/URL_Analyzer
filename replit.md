# IronCrypt - AI-Powered Malicious URL Detection System

## Overview

URL_Analyzer is a security-focused web application that detects malicious URLs using AI-powered analysis. The system provides real-time threat detection, classifying URLs as benign, suspicious, or malicious through integration with Hugging Face's inference API. Users can manually scan URLs or benefit from automatic monitoring, with all scan results persisted in a PostgreSQL database. The application features a modern, security-focused UI built with React and shadcn/ui components.
URL_Analyzer is a security-focused web application that detects malicious URLs using AI-powered analysis. The system provides real-time threat detection, classifying URLs as benign, suspicious, or malicious through integration with OpenAI's API. Users can manually scan URLs or benefit from automatic monitoring, with all scan results persisted in a PostgreSQL database. The application features a modern, security-focused UI built with React and shadcn/ui components.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- React 18 with TypeScript for type safety and modern component patterns
- Vite as the build tool and development server, providing fast HMR and optimized production builds
- Wouter for lightweight client-side routing (Home, Dashboard, NotFound pages)
- Component-based architecture with reusable UI primitives from shadcn/ui

**State Management**
- TanStack Query (React Query) for server state management, caching, and data synchronization
- Local React state (useState) for UI-specific state
- Custom hooks (useURLMonitor, useIsMobile, useToast) for shared logic

**UI Component System**
- shadcn/ui components built on Radix UI primitives for accessibility
- Tailwind CSS for utility-first styling with custom design system
- CSS variables for theming (supports dark mode as primary)
- Custom components: URLScanner, ScanResult, ThreatBadge, ConfidenceMeter, ScanHistoryTable, GuestBanner, Header

**Design System**
- Dark mode primary with security-focused color palette
- Threat level colors: benign (green), suspicious (amber), malicious (red), scanning (blue)
- Typography: Inter for UI text, JetBrains Mono for monospace (URLs/technical data)
- Responsive layout with mobile-first approach using Tailwind breakpoints

### Backend Architecture

**Server Framework**
- Express.js application with TypeScript
- Custom middleware for request logging and error handling
- RESTful API pattern with `/api` prefix for all application routes
- HTTP server using Node's built-in `http.createServer`

**Development Environment**
- Vite middleware integration for development (HMR, asset serving)
- Replit-specific plugins for error overlays and development banners
- Separate development and production modes with environment-specific configurations

**Storage Layer**
- In-memory storage implementation (MemStorage class) for development/testing
- IStorage interface defining CRUD operations for future database integration
- User management with UUID-based identifiers

**Planned Features** (from requirements)
- JWT-based authentication for user sessions
- Background URL monitoring for automatic threat detection
- Integration with OpenAI's API for AI-powered URL classification
- Rule-based fallback logic (domain reputation, entropy, keyword analysis)

### Data Storage

**Database**
- PostgreSQL as the primary database (Neon serverless)
- Drizzle ORM for type-safe database operations and migrations
- WebSocket connection via @neondatabase/serverless for serverless environments

**Schema Design**
- Users table: id (UUID), username (unique), password
- Planned scan results table: URL, timestamp, classification, confidence, source (auto/manual), user relationship

**Migration Strategy**
- Drizzle Kit for schema management and migrations
- Migration files stored in `/migrations` directory
- Schema definitions in shared TypeScript files for type sharing between client/server

### Authentication & Authorization

**Planned Implementation**
- JWT-based authentication for stateless session management
- User registration and login endpoints
- Password hashing for secure credential storage
- Session middleware to protect authenticated routes
- Role-based access control for admin features (blacklist/whitelist management, AI model health)

### AI Integration

**OpenAI API**
- Environment variable (OPENAI_API_KEY) for API authentication
- URL classification using a custom GPT model for threat detection
- Confidence scoring for classification results
- Signal extraction for threat indicators

**Fallback Logic**
- Rule-based classification when AI service is unavailable
- Domain reputation checking
- URL entropy analysis
- Malicious keyword detection

## External Dependencies

### Third-Party Services

- **OpenAI API**
- Purpose: AI-powered URL classification
- Authentication: API key via environment variable
- Usage: Real-time threat detection and confidence scoring

**Neon PostgreSQL**
- Purpose: Serverless PostgreSQL database hosting
- Connection: WebSocket-based via @neondatabase/serverless
- Configuration: DATABASE_URL environment variable

### Key NPM Packages

**UI & Styling**
- @radix-ui/* (v1.x): Accessible component primitives
- tailwindcss: Utility-first CSS framework
- class-variance-authority: Type-safe component variants
- lucide-react: Icon library

**State & Data Management**
- @tanstack/react-query (v5): Server state management
- wouter: Lightweight routing
- drizzle-orm: TypeScript ORM
- zod: Schema validation

**Forms & Validation**
- react-hook-form: Form state management
- @hookform/resolvers: Validation resolver integration
- drizzle-zod: Zod schema generation from Drizzle schemas

**Development Tools**
- vite: Build tool and dev server
- tsx: TypeScript execution for Node.js
- esbuild: JavaScript/TypeScript bundler for production
- @replit/vite-plugin-*: Replit-specific development enhancements

**Date & Utilities**
- date-fns: Date formatting and manipulation
- nanoid: Unique ID generation
- ws: WebSocket client for Neon database.

### Browser Extension (Planned)

**Manifest V3 Extension**
- Background service worker for active tab URL monitoring
- Popup UI for manual scanning and status display
- Communication with backend /scan API
- Link to web portal for full scan history
