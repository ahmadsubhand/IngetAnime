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
  <img src="../assets/icon/typescript.svg" alt="TypeScript" height="20" />
  &nbsp;&nbsp;
  <img src="../assets/icon/nestjs.svg" alt="NestJS" height="20" />
  &nbsp;&nbsp;
  <img src="../assets/icon/postgresql.svg" alt="PostgreSQL" height="20" />
  &nbsp;&nbsp;
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="../assets/icon/prisma-dark.svg" />
    <source media="(prefers-color-scheme: light)" srcset="../assets/icon/prisma.svg" />
    <img src="../assets/icon/prisma.svg" alt="Prisma" height="20" />
  </picture>
  &nbsp;&nbsp;
  <img src="../assets/icon/google.png" alt="Google" height="20" />
  &nbsp;&nbsp;
  <img src="../assets/icon/mal.png" alt="MyAnimeList" height="20" />
</p>

The backend of **IngetAnime** is a REST API built with NestJS, TypeScript, PostgreSQL, and Prisma ORM. It handles authentication, anime data, user watchlists, streaming platform information, and integration with third-party services such as Google OAuth and MyAnimeList.

## 🛠️ Prerequisites

Make sure the following tools and services are available before getting started:

- **Node.js** — a version compatible with the project.
- **npm** — for dependency management.
- **PostgreSQL** — for the application database.
- **Git** — for cloning the repository.

## 🚀 Installation & Setup

### 1. Clone the Repository

Clone the repository and navigate to the backend directory:

```bash
git clone https://github.com/ahmadsubhand/IngetAnime.git
cd backend
```

If you have already cloned the unified IngetAnime repository, navigate directly to the `backend` directory instead.

### 2. Install Dependencies

Install the project dependencies:

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the backend root directory, alongside `package.json`, using `.env.example` as a reference.

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

# Application
PORT=4000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
CSRF_SECRET="your-csrf-secret"

# Database
DATABASE_URL="postgresql://username:password@localhost:5432/ingetanime"

# JWT
JWT_SECRET="your-jwt-secret"
JWT_EXPIRATION="28d"

# Mailer
MAILER_USER="your-email@example.com"
MAILER_PASSWORD="your-email-app-password"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# MyAnimeList (MAL) OAuth
MAL_CLIENT_ID="your-mal-client-id"
MAL_CLIENT_SECRET="your-mal-client-secret"
```

Replace all placeholder values with your actual configuration. Do not leave any variable empty.

#### Application Configuration

| Variable | Description |
|---|---|
| `PORT` | Port used by the backend server. |
| `NODE_ENV` | Application environment, such as `development` or `production`. |
| `CLIENT_URL` | Base URL of the frontend application. |
| `CSRF_SECRET` | Secret used for CSRF token protection. |

Generate a strong secret for `CSRF_SECRET` and `JWT_SECRET`. For example, using Node.js:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Run the command separately for each secret and use a different value for each. Keep these secrets private.

#### Database Configuration

Install and start PostgreSQL, then create a database named `ingetanime` if it does not already exist.

For example, using `psql`:

```sql
CREATE DATABASE ingetanime;
```

Configure `DATABASE_URL` using the connection string format:

```text
postgresql://username:password@localhost:5432/ingetanime
```

Replace `username` and `password` with your PostgreSQL credentials. Update the host and port if your database runs elsewhere.

If the password contains special characters, URL-encode the relevant credentials before placing them in the connection string.

#### Gmail SMTP Configuration

The application uses SMTP to send emails for notifications and account-related processes.

If you use Gmail:

1. Open your [Google Account Security settings](https://myaccount.google.com/security).
2. Enable **2-Step Verification** if it is not already enabled.
3. Open the [Google App Passwords page](https://myaccount.google.com/apppasswords).
4. Create an App Password for the application.
5. Set `MAILER_USER` to your Gmail address and `MAILER_PASSWORD` to the generated App Password.

Example:

```dotenv
MAILER_USER="your-email@gmail.com"
MAILER_PASSWORD="your-16-character-app-password"
```

Do not use your regular Gmail login password for SMTP authentication. App Passwords require 2-Step Verification and may not be available for certain account configurations.

#### Google OAuth Configuration

Google OAuth enables users to authenticate or connect their Google accounts.

1. Open the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a project or select an existing project.
3. Configure the OAuth consent screen and provide the required application information.
4. Open **APIs & Services → Credentials**.
5. Create an OAuth client ID and select **Web application**.
6. Configure the authorized JavaScript origins and redirect URIs in Google Cloud Console:
   - **Authorized JavaScript origins:** `http://localhost:3000`
   - **Authorized redirect URIs:**
     - `http://localhost:3000/auth/third-party-login`
     - `http://localhost:3000/user/settings`

   These URLs correspond to the frontend redirects configured by the backend:

   ```typescript
   this.authRedirect = `${config.getOrThrow('CLIENT_URL')}/auth/third-party-login`;
   this.settingRedirect = `${config.getOrThrow('CLIENT_URL')}/user/settings`;
   ```

   Replace `http://localhost:3000` with your production frontend URL when configuring the production OAuth client.
7. Copy the generated client ID and client secret into `.env`.

```dotenv
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

Make sure the redirect URI registered in Google Cloud Console exactly matches the callback URL used by the application.

Official documentation: [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2).

#### MyAnimeList OAuth Configuration

MyAnimeList OAuth allows users to connect their MAL accounts and synchronize their anime lists.

1. Sign in to [MyAnimeList](https://myanimelist.net/).
2. Open the [MyAnimeList API Configuration page](https://myanimelist.net/apiconfig).
3. Register an application if one does not already exist.
4. Configure the application details and redirect URIs according to the backend OAuth implementation:
   - **Redirect URI for authentication:** `http://localhost:3000/auth/third-party-login`
   - **Redirect URI for account settings:** `http://localhost:3000/user/settings`

   These URLs correspond to the frontend redirects configured by the backend:

   ```typescript
   this.AUTH_REDIRECT_URI = `${config.getOrThrow('CLIENT_URL')}/auth/third-party-login`;
   this.SETTING_REDIRECT_URI = `${config.getOrThrow('CLIENT_URL')}/user/settings`;
   ```

   Replace `http://localhost:3000` with your production frontend URL when configuring the production application.
5. Copy the credentials provided by MyAnimeList into `.env`.

```dotenv
MAL_CLIENT_ID="your-mal-client-id"
MAL_CLIENT_SECRET="your-mal-client-secret"
```

Ensure the registered redirect URI matches the callback URL used by the application.

### 4. Set Up Prisma & Database Migrations

Prisma manages the database schema, migrations, and database client.

First, generate the Prisma Client:

```bash
npx prisma generate
```

Apply the existing database migrations:

```bash
npx prisma migrate dev
```

To inspect and manage the database visually, run:

```bash
npx prisma studio
```

Prisma Studio opens a browser-based interface for viewing and editing database records.

### 5. Run the Backend

Start the development server:

```bash
npm run start:dev
```

The API should be available at:

```text
http://localhost:4000
```

The actual port depends on the `PORT` value in `.env`.

Use the following command to build the application:

```bash
npm run build
```

To start the built application, use:

```bash
npm run start:prod
```

The production command assumes the project's npm scripts build the application into the expected output directory.

## 📁 Project Structure

```text
backend/
├── dist/                 # Compiled application output
├── node_modules/         # Installed dependencies
├── prisma/
│   ├── migrations/       # Database migration history
│   └── schema.prisma     # Database schema and models
├── src/
│   ├── common/           # Shared components and utilities
│   ├── generated/        # Generated prisma client
│   ├── modules/          # Feature modules and business logic
│       └── anime/
│           ├── anime.controller.ts       # API endpoints
│           ├── anime.model.d.ts          # Type declarations
│           ├── anime.module.ts           # Feature module
│           ├── anime.service.ts          # Business logic
│           └── anime.validation.ts       # Input validation
│   ├── types/            # Shared TypeScript types
│   ├── utils/            # Utility functions
│   ├── validator/        # Shared validation logic
│   ├── app.controller.ts # Root application controller
│   ├── app.module.ts     # Root application module
│   └── main.ts           # Application entry point
├── templates/            # Email templates
├── test/                 # Automated tests
├── uploads/              # Uploaded files
├── views/                # View templates
├── .env                  # Local environment variables
├── .env.example          # Environment variable template
├── .gitignore            # Git ignore rules
├── .prettierrc           # Prettier configuration
├── eslint.config.mjs     # ESLint configuration
├── nest-cli.json         # NestJS CLI configuration
└── package-lock.json     # Locked npm dependency versions
├── package.json          # Project metadata and npm scripts
├── prisma.config.ts      # Prisma configuration
├── README.md             # Backend documentation
├── tsconfig.build.json   # TypeScript build configuration
└── tsconfig.json         # TypeScript compiler configuration
```

**Notes:**
- Configure environment variables in `.env` using `.env.example` as a reference.
- `dist/`,  `node_modules/`, `src/generated/prisma/`, and `uploads/` are generated locally and should not be committed to version control.
- Database schema changes are managed through Prisma migrations.

## 🔐 Security Notes

- Never commit `.env` or expose credentials, API secrets, JWT secrets, or Gmail App Passwords.
- Keep `.env.example` populated with placeholder values only.
- Use strong, unique secrets for `JWT_SECRET` and `CSRF_SECRET`.
- Configure OAuth redirect URIs to match the application's actual callback URLs.
- Use production-specific environment variables and database credentials when deploying the application.
- Run production migrations using `npx prisma migrate deploy` rather than using development migration commands.

## 📚 Related Documentation

- [NestJS Documentation](https://docs.nestjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [MyAnimeList API](https://myanimelist.net/apiconfig)
