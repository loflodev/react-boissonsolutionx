# Boisson Solution X

A modern web application built with React, TypeScript, and Vite, featuring a headless WordPress backend with GraphQL API integration and Contact Form 7 for form handling.

## 🚀 Tech Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **Form Handling**: React Hook Form
- **Backend**: Headless WordPress
- **API**: WPGraphQL
- **Forms**: Contact Form 7 with WPGraphQL extension
- **Deployment**: Vercel/Netlify (Frontend) + Managed WordPress Hosting (Backend)

## 🛠 Prerequisites

- Node.js 16+ & npm/yarn
- WordPress 6.0+ installation
- PHP 8.0+
- MySQL 5.7+ or MariaDB 10.3+

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone [your-repository-url]
cd boissonsolutionx
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Setup

Create a `.env` file in the root directory:

```env
VITE_WORDPRESS_API_URL=your-wordpress-site.com/graphql
VITE_SITE_NAME="Boisson Solution X"
# Add other environment variables as needed
```

### 4. Development Server

```bash
npm run dev
# or
yarn dev
```

## 🔧 WordPress Setup (Backend)

### Required Plugins

1. **WPGraphQL** - Provides GraphQL API
2. **WPGraphQL for Contact Form 7** - Extends WPGraphQL for form submissions
3. **Contact Form 7** - Form builder plugin

### WordPress Configuration

1. Install and activate the required plugins
2. Create your contact form in WordPress admin (Contact > Add New)
3. Note the form ID for use in your frontend components
4. Configure the form's email settings in WordPress admin

## 🧩 GraphQL Integration

The project includes custom GraphQL types and mutations for handling form submissions. These are defined in `functions.php` and extend the default WPGraphQL schema.

### Available Queries & Mutations

- `createContactMessage`: Submit a new contact form. Saves it as a private `contact_message` post and emails it through Contact Form 7

## 📦 Building for Production

```bash
npm run build
# or
yarn build
```

## 🌐 Deployment

### Frontend
Deploy the built `dist` folder to your preferred static hosting (Vercel, Netlify, etc.)

### Backend
- Ensure your WordPress installation is publicly accessible
- Configure proper CORS headers
- Set up proper authentication if needed

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
