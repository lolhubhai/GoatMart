# Overview

GoatMart is a platform for sharing and discovering bot commands, specifically designed for GoatBot, MiraiBot, and AutoBot communities. The application provides a user-friendly interface for uploading, browsing, and managing bot commands with features like real-time statistics, search functionality, and mobile-optimized Android Material Design UI. Built as a full-stack web application with Express.js backend and MongoDB database, it serves as a centralized hub for bot developers to share their creations.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The frontend is built using vanilla JavaScript with Android Material Design principles, providing a native mobile app-like experience. The UI framework consists of modular components including:

- **Material Design System**: Comprehensive CSS variables and component library following Android design guidelines
- **Progressive Web App Features**: Mobile-first design with touch optimizations, ripple effects, and offline capability preparation
- **Modular JavaScript Architecture**: Separate modules for core functionality (main.js), UI components, animations, analytics, and Android-specific UI enhancements
- **Code Editor Integration**: CodeMirror integration for syntax highlighting and code editing in the upload interface

## Backend Architecture
The backend follows a RESTful API design pattern with Express.js:

- **MongoDB Integration**: Uses Mongoose ODM for database operations with a flexible schema for command storage
- **Authentication System**: Admin authentication with session management using in-memory token storage
- **Maintenance Mode**: Built-in maintenance mode functionality with configurable messages and admin controls
- **File Upload System**: Supports both form-based uploads and direct code pasting with validation
- **Statistics Engine**: Real-time tracking of views, likes, uploads, and user activity

## Data Storage
- **Primary Database**: MongoDB for storing commands, user data, and statistics
- **Schema Design**: Flexible document structure supporting command metadata, author information, likes, views, and categorization
- **Sequential ID Generation**: Custom ID generation system for user-friendly command referencing

## API Design
RESTful endpoints following REST conventions:
- **GET /api/items**: Paginated command listing with filtering
- **GET /api/item/:itemId**: Individual command retrieval with view tracking
- **POST /api/items**: Command creation with validation
- **POST /api/items/:id/like**: Like functionality with duplicate prevention
- **GET /api/stats**: Platform statistics and analytics data

## Admin System
- **Authentication**: Simple credential-based admin login system
- **Dashboard**: Comprehensive admin interface for content management and platform statistics
- **Maintenance Controls**: Admin-controlled maintenance mode with custom messaging

# External Dependencies

## Core Framework Dependencies
- **Express.js**: Web application framework for Node.js server implementation
- **Mongoose**: MongoDB object modeling library for database operations
- **Body-parser**: Middleware for parsing HTTP request bodies

## Frontend Libraries
- **Material Icons**: Google's Material Design icon font for consistent iconography
- **Font Awesome**: Additional icon library for enhanced UI elements
- **CodeMirror**: Code editor library with syntax highlighting and themes
- **Prism.js**: Syntax highlighting for code display in view pages
- **Chart.js**: Data visualization library for analytics dashboard

## Database
- **MongoDB**: Primary database for storing all application data including commands, statistics, and user information

## Deployment
- **Vercel**: Configured for serverless deployment with Node.js runtime
- **Railway**: Alternative deployment platform as indicated by the base URL configuration

## Development Tools
- **@types/node**: TypeScript definitions for Node.js development
- **Axios**: HTTP client library for API requests (though not extensively used in current codebase)