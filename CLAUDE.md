# Project: Next.js Web Application

## Stack
- Next.js 14+ (App Router)
- TypeScript
- Tailwind CSS

## Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Code Style

### TypeScript
- Use explicit types for function parameters and return values
- Prefer interfaces over types for object shapes
- Use `type` for unions, intersections, and utility types
- Avoid `any` - use `unknown` if type is truly unknown

### Components
- Use functional components with arrow functions
- Co-locate component files: `ComponentName/index.tsx`
- Props interface named `{ComponentName}Props`

### Naming
- Components: PascalCase (`UserProfile.tsx`)
- Utilities/hooks: camelCase (`useAuth.ts`, `formatDate.ts`)
- Constants: SCREAMING_SNAKE_CASE

## Project Structure (App Router)
```
src/
  app/           # Routes and layouts
  components/    # Reusable UI components
  lib/           # Utilities and helpers
  hooks/         # Custom React hooks
  types/         # TypeScript type definitions
```

## Tailwind Guidelines
- Use utility classes directly in JSX
- Extract repeated patterns to components, not CSS
- Use `cn()` helper for conditional classes (clsx + tailwind-merge)
