# Fiducible - Fiduciary Management Application

A comprehensive React-based fiduciary management application that helps professionals track time, manage conservatee cases, and streamline administrative workflows.

## Quick Start

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5173`

## Key Technologies

- **Frontend**: React, TypeScript, Vite
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL with Drizzle ORM
- **UI Components**: Shadcn/ui component library
- **Styling**: Tailwind CSS
- **Authentication**: Passport.js with local strategy

## Logo Integration

### Current Logo
The application logo is located at `/public/fiducible-logo.png` and features:
- Transparent background for flexible placement
- Professional shield design with checkmark
- Consistent branding with "Fiducible" text

### How to Replace the Logo

1. **Replace the logo file**:
   - Add your new logo file to the `/public/` directory
   - Name it `fiducible-logo.png` (or update references if using a different name)
   - Recommended formats: PNG (with transparency) or SVG

2. **Update logo references in the application**:
   - The logo is referenced in components using `/fiducible-logo.png`
   - Search for logo references in the codebase and update paths if needed

3. **Logo specifications**:
   - **Recommended size**: 200px width minimum for crisp display
   - **Format**: PNG with transparent background or SVG
   - **Aspect ratio**: Maintain consistent proportions for best results

4. **Testing your logo**:
   - Test the logo in both light and dark themes
   - Verify it displays correctly across different screen sizes
   - Check contrast and readability

### Logo Usage Guidelines

- Use the logo consistently across all application pages
- Maintain proper spacing around the logo (minimum 20px padding)
- Ensure the logo remains legible at all sizes
- For dark backgrounds, consider using a version with appropriate contrast

## Project Structure

```
/client          # Frontend React application
  /src
    /components  # Reusable UI components
    /pages       # Page-level views
    /hooks       # Custom React hooks
    /lib         # Utility functions and configurations
/server          # Backend Express application
  /routes.ts     # API route definitions
  /storage.ts    # Data storage interface
/shared          # Shared types and schemas
  /schema.ts     # Database schema and types
/public          # Static assets (logos, images, etc.)
```

## Features

- **User Authentication**: Secure login and registration
- **Dashboard**: Overview of conservatee cases and recent activities
- **Time Tracking**: Record and manage time entries for conservatee work
- **Conservatee Management**: Add, edit, and organize conservatee information
- **Responsive Design**: Works across desktop and mobile devices

## Development

### Database Setup
The application uses PostgreSQL. Database schema is managed through Drizzle ORM.

### Authentication
Uses Passport.js with local strategy for secure user authentication.

### Styling
Built with Tailwind CSS and Shadcn/ui components for consistent, professional design.

## Support

For questions or issues, refer to the project documentation or contact the development team.