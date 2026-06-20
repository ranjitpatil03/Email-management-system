# Architecture Overview

## System Architecture

### High-Level Components

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Application                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                    Next.js Frontend                   │  │
│  │  • Dashboard UI      • Email Table     • Detail View  │  │
│  │  • Components        • Routing         • Mock Data    │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                               │
┌─────────────────────────────────────────────────────────────┐
│                    Data Layer (Future)                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                    PostgreSQL Database                │  │
│  │  • Email Storage     • User Management • AI Analysis │  │
│  │  • Opportunities     • Tasks           • Analytics   │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                               │
┌─────────────────────────────────────────────────────────────┐
│                    AI/External Services (Future)             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                    AI Processing Engine               │  │
│  │  • Email Analysis    • Summarization  • Classification│  │
│  │  • Opportunity ID    • Priority Calc  • Sentiment     │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                    Email Providers                   │  │
│  │  • Gmail API         • Outlook API    • IMAP/SMTP    │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Frontend Architecture

### Component Structure

**Layout Components:**
- `app/layout.tsx` - Root layout with navigation
- `app/globals.css` - Global styles and Tailwind setup

**Page Components:**
- `app/page.tsx` - Dashboard home page
- `app/email/[id]/page.tsx` - Dynamic email detail pages

**Reusable Components:**
- `DashboardStats` - Statistics cards for dashboard
- `EmailTable` - Email listing with sorting and filtering

**Data Layer:**
- `mockData.ts` - Mock data with TypeScript interfaces
- Database schema prepared for future integration

### State Management

**Current (Phase 1):**
- Static mock data loaded at build time
- No client-side state management needed

**Future Enhancements:**
- React Query for server state
- Zustand for client state
- Context API for shared state

## Data Flow

### Current Implementation (Mock Data)

1. **Dashboard Load:**
   ```
   Dashboard Page → getMockEmails() → Render Stats & Table
   ```

2. **Email Detail Navigation:**
   ```
   Table Row Click → Dynamic Route (/email/[id]) → getMockEmailById(id)
   ```

### Future Implementation (With Database)

1. **Email Processing Pipeline:**
   ```
   Email Received → Store in DB → AI Analysis → Update DB → UI Update
   ```

2. **Real-time Updates:**
   ```
   WebSocket/Polling → DB Changes → UI Re-render
   ```

## Database Design

### Core Entities

1. **Email Entity:**
   - Stores raw email content
   - AI analysis results (summary, category, priority, opportunity score)
   - Metadata (sender, subject, dates)

2. **User Entity:**
   - Authentication and authorization
   - User preferences and settings

3. **Opportunity Entity:**
   - Business opportunities extracted from emails
   - Confidence scoring and tracking

4. **Task Entity:**
   - Action items generated from email analysis
   - Priority and due dates

### Schema Design Principles

1. **Normalization:** Proper table relationships
2. **Indexing:** Optimized for common queries
3. **Audit Trail:** Logging for AI analysis
4. **Flexibility:** JSONB for AI analysis data
5. **Performance:** Views for dashboard stats

## API Design (Future)

### REST Endpoints

```
GET    /api/emails           - List emails with filters
GET    /api/emails/{id}      - Get email details
POST   /api/emails/analyze   - Submit email for AI analysis
GET    /api/stats            - Dashboard statistics
GET    /api/opportunities    - List opportunities
POST   /api/tasks            - Create tasks from email
```

### WebSocket Events

```
email:new        - New email received
email:analyzed   - Email analysis complete
opportunity:new  - New opportunity detected
task:assigned    - New task created
```

## Security Considerations

### Current (Phase 1):
- No authentication/authorization (mock data only)

### Future Implementation:
1. **Authentication:** JWT tokens, OAuth for email providers
2. **Authorization:** Role-based access control
3. **Data Encryption:** At-rest and in-transit encryption
4. **Audit Logging:** All AI analysis and data access
5. **Rate Limiting:** API request limiting

## Performance Optimization

### Frontend:
- Static generation where possible
- Dynamic imports for large components
- Image optimization
- Code splitting

### Backend (Future):
- Database connection pooling
- Query optimization with indexes
- Caching layer (Redis)
- Background job processing

## Deployment Architecture

### Development:
- Local development with hot reload
- Mock data for testing

### Production (Future):
```
┌─────────────────────────────────────────────────────────────┐
│                    Load Balancer                            │
└───────────────────────────────────────────��─────────────────┘
                               │
                ┌─────────────────────────────┐
                ▼                             ▼
┌─────────────────────────────┐  ┌─────────────────────────────┐
│      Next.js Frontend       │  │      API Server            │
│      (Vercel/Cloud)         │  │      (Node.js/Express)      │
└─────────────────────────────┘  └─────────────────────────────┘
                                           │
                                ┌─────────────────────────────┐
                                │      PostgreSQL            │
                                │      (Managed DB)           │
                                └─────────────────────────────┘
                                           │
                                ┌─────────────────────────────┐
                                │      Redis Cache           │
                                │      (Optional)             │
                                └─────────────────────────────┘
```

## Development Guidelines

### Code Organization:
- Feature-based folder structure
- Shared components in `app/components/`
- Utilities in `app/lib/`
- Types in `app/types/`

### Coding Standards:
- TypeScript strict mode enabled
- ESLint configuration for code quality
- Prettier for code formatting
- Component-driven development

### Testing Strategy:
- Unit tests for utilities and components
- Integration tests for data flow
- E2E tests for critical user journeys
- Mock API responses for testing

## Handoff Checklist

### Phase 1 Complete:
- [x] Project scaffolding
- [x] Dashboard UI with stats
- [x] Email listing table
- [x] Email detail pages
- [x] Mock data system
- [x] Database schema design
- [x] Documentation

### Next Steps for Phase 2:
1. Set up PostgreSQL database
2. Implement database connection
3. Replace mock data with real queries
4. Add user authentication
5. Create API routes
6. Implement email synchronization

### Technical Debt:
- Mock data needs to be replaced
- No error handling for missing emails
- Limited accessibility features
- No internationalization
- Basic navigation structure