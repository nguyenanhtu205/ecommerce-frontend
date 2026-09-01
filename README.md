# Ecommerce Frontend

This repository contains the frontend application for the ecommerce platform, built with React and TypeScript.

## Prerequisites

Before running this project, make sure you have the following installed on your machine:

- Node.js (LTS version recommended)
- pnpm

If you do not have pnpm installed yet, you can install it with:

```bash
npm install -g pnpm
```

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/nguyenanhtu205/ecommerce-frontend.git
cd ecommerce-frontend
```

### 2. Configure environment variables

Copy the example environment file:

```bash
cp .env.example .env
```

### 3. Install dependencies

```bash
pnpm install
```

### 4. Run the development server

```bash
pnpm dev
```

The application will start on a local development server. Check the terminal output for the exact URL (typically `http://localhost:5173`).

## Available Scripts

- `pnpm dev` — start the development server with hot reload
- `pnpm build` — build the application for production
- `pnpm preview` — preview the production build locally
- `pnpm lint` — run the linter to check for code issues

## Notes

- Make sure the backend services are running before starting the frontend, since most pages depend on data from the API gateway.
- If you encounter CORS issues while developing locally, verify that the API base URL in your `.env` file matches the gateway address and that the gateway is configured to allow requests from the frontend's local origin.
