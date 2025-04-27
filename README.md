# Booth by nmillrr 📸

A small photo processing web app with React frontend and Node.js backend. Inspired by Booth by Bryant, this app turns images into vintage photobooth-styled photos.

## Features

- Image upload with drag-and-drop
- Real-time processing with progress indicators
- Beautiful photo adjustments with custom filters
- Mobile-friendly responsive design
- Smooth animations and transitions
- Robust error handling and retry mechanism

## Tech Stack

- **Frontend**: React, TailwindCSS, Vite
- **Backend**: Node.js, Express
- **Image Processing**: Sharp
- **Deployment**: Vercel (monorepo deployment)

## Project Structure

```
.
├── api/                 # Serverless API functions for Vercel
├── backend/             # Express.js backend
│   ├── src/             # Source code
│   │   ├── config/      # Application configuration
│   │   ├── controllers/ # Route controllers
│   │   ├── middleware/  # Express middleware
│   │   ├── routes/      # API routes
│   │   ├── services/    # Business logic
│   │   └── utils/       # Utility functions
│   └── uploads/         # Temporary file storage
├── frontend/            # React frontend
│   ├── public/          # Static assets
│   └── src/             # Source code
│       ├── components/  # Reusable components
│       ├── context/     # React context providers
│       ├── pages/       # Page components
│       └── utils/       # Utility functions
└── vercel.json          # Vercel configuration
```

## Development

### Prerequisites

- Node.js 16+
- npm or yarn

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/photo-booth.git
   cd photo-booth
   ```

2. Install dependencies:
   ```bash
   npm run install:all
   ```

3. Create a `.env` file based on the example:
   ```bash
   cp .env.example .env
   ```

4. Start the development servers:
   ```bash
   npm run dev
   ```
   This will start both the frontend (http://localhost:5173) and backend (http://localhost:3001) servers.

## License

MIT
