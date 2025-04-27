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

## Deployment

### Vercel Monorepo

1. Connect your GitHub repository to Vercel
2. Configure the project:
   - Build Command: `npm run build`
   - Output Directory: `frontend/dist`
   - Install Command: `npm run install:all`
3. Add the following environment variables:
   - `NODE_ENV`: `production`
   - `CORS_ORIGIN`: Your frontend URL (e.g., `https://your-app.vercel.app`)
   - `MAX_FILE_SIZE`: `10485760` (or your preferred limit)
   - `ENABLE_SERVERLESS`: `true`
4. Deploy!

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| NODE_ENV | Environment (development/production) | development |
| PORT | Backend server port | 3001 |
| CORS_ORIGIN | Allowed origins for CORS | http://localhost:5173 |
| MAX_FILE_SIZE | Maximum file upload size in bytes | 10485760 (10MB) |
| IMAGE_QUALITY | JPEG image quality (1-100) | 85 |
| MAX_WIDTH | Maximum width for processed images | 1600 |
| MAX_HEIGHT | Maximum height for processed images | 1600 |
| ENABLE_SERVERLESS | Enable serverless mode | false |

## License

MIT