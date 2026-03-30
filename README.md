# Boost Baguio 🌲

**Boost Baguio** is a Progressive Web App (PWA) for navigating Baguio City with jeepney routes, tourist spots, events, and nearby places discovery.

By **BaguioBoosters**

## Features

| Feature      | Description                       |
| ------------ | --------------------------------- |
| **APANAM**   | Point-to-point jeepney navigation |
| **PAGNAAM**  | Jeepney routes directory          |
| **MAYKAN**   | Tourist spots & places discovery  |
| **ARAMIDEM** | Events calendar                   |
| **AYAN MO**  | Nearby places finder              |

## Tech Stack

- **Frontend:** Vue.js 3.5 + Quasar 2.16
- **State:** Pinia 3.0
- **Backend:** Firebase (Auth, Firestore, Storage)
- **Maps:** Leaflet 1.9
- **Build:** Vite (via Quasar)
- **Deployment:** Vercel
- **Package Manager:** pnpm

## Prerequisites

- Node.js 20+
- pnpm 10+

## Install Dependencies

```bash
pnpm install
```

## Development

Start the dev server with hot-reloading:

```bash
pnpm dev
```

The app will open at `http://localhost:9200`

## Build for Production

```bash
pnpm build
```

Build output: `dist/pwa/`

## Code Quality

```bash
# Lint files
pnpm lint

# Fix linting issues
pnpm lint:fix

# Check formatting
pnpm format:check

# Format files
pnpm format

# Run tests
pnpm test

# Run tests with coverage
pnpm test:coverage
```

## Project Structure

```
BOOST-BAGUIO/
├── src/                 # Main source code
│   ├── boot/            # Boot files (Firebase, Pinia, guards)
│   ├── components/      # Reusable Vue components
│   │   ├── admin/       # Admin dashboard components
│   │   └── home/        # Homepage section components
│   ├── composables/     # Vue 3 composable functions
│   ├── layouts/         # Layout components
│   ├── pages/           # Page components (routes)
│   │   └── admin/       # Admin pages
│   ├── router/          # Vue Router configuration
│   ├── stores/          # Pinia state stores
│   └── utils/           # Utility functions
├── public/              # Static assets
├── src-pwa/             # PWA configuration
└── .github/workflows/   # CI/CD pipeline
```

## Deployment

### Vercel (Recommended)

The project is configured for automatic deployment on push to `main` branch via GitHub Actions.

Manual deployment:

```bash
pnpm build
vercel deploy --prod
```

### Firebase Hosting

```bash
pnpm build
firebase deploy --only hosting
```

## CI/CD

GitHub Actions pipeline runs on push to `main` or `develop`:

1. **Lint** - ESLint + Prettier
2. **Test** - Vitest unit tests
3. **Build** - Production build
4. **Deploy** - Auto-deploy to Vercel

[![CI/CD](https://github.com/KhrystellineA/boostbaguio_qf/actions/workflows/ci.yml/badge.svg)](https://github.com/KhrystellineA/boostbaguio_qf/actions/workflows/ci.yml)

## License

MIT © BaguioBoosters
