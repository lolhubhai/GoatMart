# GoatMart
GoatMart is a platform designed for sharing and discovering bot commands in a user-friendly interface. With a robust backend built on Express and MongoDB, GoatMart streamlines the process of finding and sharing commands among developers.
## Table of Contents
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Contributing](#contributing)
- [License](#license)
## Features
- User authentication and management
- Item upload and sharing
- Real-time statistics tracking
- Dynamic item pages with metadata
- Search and filter commands
- Mobile-friendly design with touch feedback
- API for fetching and managing bot commands
## Installation
To set up GoatMart locally, follow these steps:
1. Clone the repository:
   ```bash
   git clone https://github.com/arychauhan/GoatMart.git
   cd GoatMart
Install the dependencies:

npm install
Set up your MongoDB database (replace the connection string in  with your own).

Usage
To start the server, run:

node index.js
Visit http://0.0.0.0:3000 in your browser to access the application.

You can also run the application using the provided npm scripts:

npm start
API Endpoints
GoatMart provides several API endpoints to interact with the platform:

GET /api/items: Retrieve a list of bot commands with pagination.
GET /api/item/:itemId: Get details of a specific command by its ID.
POST /api/items: Upload a new command.
POST /api/items/:id/like: Like a specific command.
GET /api/stats: Fetch statistics about the platform usage.
Refer to the source code for more detailed information about each endpoint and their parameters.

Contributing
Contributions are welcome! Please fork the repository and submit a pull request for any changes or improvements.
