# Investment Portfolio Dashboard

A modern web application for managing investment portfolios, built with React and TypeScript.

## Features

- Secure authentication system
- Real-time portfolio overview
- Investment metrics visualization
- Transaction history
- Responsive design

## Tech Stack

- React 18
- TypeScript
- Vite
- Axios for API calls
- Modern CSS with custom properties
- Responsive design with mobile-first approach

## Getting Started

### Prerequisites

- Node.js 16+ and npm

### Installation

1. Clone the repository:
```bash
git clone [repository-url]
```

2. Install dependencies:
```bash
cd investment-dashboard
npm install
```

3. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Building for Production

To create a production build:

```bash
npm run build
```

## Project Structure

```
src/
  ├── components/     # Reusable components
  ├── pages/         # Page components
  ├── assets/        # Static assets
  ├── App.tsx        # Main application component
  ├── main.tsx       # Application entry point
  └── App.css        # Global styles
```

## API Integration

The application connects to a backend API running on `http://localhost:5001`. Make sure the backend server is running before starting the application.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request 