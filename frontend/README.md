# Frontend Recruitment Platform

This is a frontend web application for a recruitment platform, built with modern web technologies including Vite and Tailwind CSS. The platform includes different portals and dashboards tailored for Candidates, Recruiters, and Administrators.

## Project Structure

The project features a responsive and aesthetic design with various HTML templates for different user roles:
- **Landing Page** (`landing_page.html`)
- **Authentication:** Login (`login.html`) and Registration (`register.html`)
- **Candidate Portal:** Dashboard (`daboard_candidat.html`), Resume Analysis (`analyse_cv.html`)
- **Recruiter Portal:** Dashboard (`dashboard_recruteur.html`)
- **Admin Portal:** Dashboard (`dashboard_administrateur.html`), User Management (`admin_utilisateurs.html`), Offers Management (`admin_offres.html`)
- **AI Assistant:** (`assistant_ia.html`)

## Technologies Used
- HTML5 / CSS3 / JavaScript
- Tailwind CSS
- Vite (Bundler)

## Getting Started

1. Install the dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

## Development

The project uses PostCSS and Tailwind CSS for styling. Ensure extending the configurations within `tailwind.config.js` and `postcss.config.js` as required for further customization.
