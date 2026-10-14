<p align="center">
  <picture>
    <source
      media="(prefers-color-scheme: dark)"
      srcset="../assets/logo-dark.svg"
    />
    <source
      media="(prefers-color-scheme: light)"
      srcset="../assets/logo.svg"
    />
    <img
      src=./assets/logo.svg"
      alt="IngetAnime Logo"
      width="300"
    />
  </picture>
</p>

<p align="center">
  <img src="../assets/typescript.svg" alt="TypeScript" height="20" />
  &nbsp;&nbsp;
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="../assets/nextjs-dark.svg" />
    <source media="(prefers-color-scheme: light)" srcset="../assets/nextjs.svg" />
    <img src="../assets/nextjs.svg" alt="Next.js" height="20" />
  </picture>
  &nbsp;&nbsp;
  <img src="../assets/tailwindcss.svg" alt="Tailwind CSS" height="20" />
  &nbsp;&nbsp;
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="../assets/shadcn-dark.svg" />
    <source media="(prefers-color-scheme: light)" srcset="../assets/shadcn.svg" />
    <img src="../assets/shadcn.svg" alt="shadcn/ui" height="20" />
  </picture>
  &nbsp;&nbsp;
  <img src="../assets/react-query.svg" alt="TanStack React Query" height="20" />
  &nbsp;&nbsp;
  <img src="../assets/react-hook-form.svg" alt="React Hook Form" height="20" />
  &nbsp;&nbsp;
  <img src="../assets/axios.svg" alt="Axios" height="20" />
</p>

The frontend of **IngetAnime** is a web application built with Next.js, React, and TypeScript. It provides the user interface for discovering anime, exploring rankings and schedules, managing personal watchlists, and viewing available streaming platforms. It uses Tailwind CSS and shadcn/ui for styling, TanStack React Query for server-state management, React Hook Form for form handling, and Axios for API communication.

---

## 📋 Prerequisites

Make sure you have the following installed:

- **Node.js** — a version compatible with the project.
- **npm** — for dependency management.
- **Git** — for cloning the repository.

---

## 🚀 Installation

### 1. Clone the Repository

Clone the repository and navigate to the frontend directory:

```bash
git clone https://github.com/ahmadsubhand/IngetAnime.git
cd frontend
```

If you have already cloned the unified IngetAnime repository, navigate directly to the `frontend` directory instead.

### 2. Install dependencies

Install the project dependencies:

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the frontend root directory, alongside `package.json`, using `.env.example` as a reference.

```bash
cp .env.example .env
```

On Windows Command Prompt, you can use:

```cmd
copy .env.example .env
```

Open `.env` and configure all required variables:

```dotenv
# All variables are required

# Backend application URL
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000

# Application environment: development or production
NODE_ENV=development
```

| Variable                   | Description                                                                                                    |
| -------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_API_BASE_URL` | Base URL of the backend API.                                                                                   |
| `NODE_ENV`                 | Application environment, typically `development` for local development and `production` for production builds. |

**Important:** Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser. Do not store secrets or sensitive credentials in them.

---

## ▶️ Running the Application

Start the development server:

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

Build the application for production:

```bash
npm run build
```

Start the production server after building:

```bash
npm run start
```

> Make sure the backend application is running and `NEXT_PUBLIC_API_BASE_URL` points to the correct backend URL.

---

## 📁 Project Structure

```text
frontend/
├── .next/                    # Next.js build output and cache
├── app/                      # Next.js App Router pages and layouts
│   ├── anime/                # Anime-related pages
│   ├── auth/                 # Authentication pages and routes
│   ├── timeline/             # Anime timeline pages
│   ├── user/                 # User-related pages
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout
│   ├── loading.tsx           # Loading UI
│   ├── page.tsx              # Home page
├── components/               # Reusable UI components
│   ├── ui/                   # Base UI components
│   └── ...                   # Application UI components
├── enums/                    # Application enumerations
├── fonts/                    # Font assets and definitions
├── helper/                   # Helper functions
├── hooks/                    # Custom React hooks
├── lib/                      # Shared libraries and configurations
├── node_modules/             # Installed dependencies
├── providers/                # React context providers
├── public/                   # Static assets
├── services/                 # API services and data fetching
├── types/                    # TypeScript type definitions
├── validator/                # Input validation schemas
├── .env                      # Local environment variables
├── .env.example              # Environment variable template
├── .gitignore                # Git ignore rules
├── .prettierrc               # Prettier configuration
├── components.json           # UI component generator configuration
├── eslint.config.mjs         # ESLint configuration
├── next-env.d.ts             # Next.js TypeScript declarations
├── next.config.ts            # Next.js configuration
├── package-lock.json         # Locked npm dependency versions
├── package.json              # Project metadata and npm scripts
├── postcss.config.mjs        # PostCSS configuration
├── README.md                 # Frontend documentation
└── tsconfig.json             # TypeScript configuration
```

**Notes:**

- `.next/` and `node_modules/` are generated locally and should not be committed to version control.
- Configure environment variables in `.env` using `.env.example` as a reference.
- `app/` follows the Next.js App Router convention, while `services/` contains API-related logic.

---

## 🔒 Security Notes

- Never commit `.env` files containing local or sensitive configuration.
- Do not put secrets, private API keys, or credentials in `NEXT_PUBLIC_` variables.
- Use HTTPS for the backend URL in production.

---

## 📚 Related Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/docs)
- [TanStack Query Documentation](https://tanstack.com/query/latest/docs/framework/react/overview)
- [React Hook Form Documentation](https://react-hook-form.com/)
- [Zod Documentation](https://zod.dev/)
