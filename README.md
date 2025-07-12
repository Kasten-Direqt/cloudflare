# Cloudflare HTTP Message Signatures Demo

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/en/)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

A full-stack application demonstrating HTTP Message Signatures for secure API communication using Cloudflare's Web Bot Auth implementation.

## Overview

This project provides a working implementation of [HTTP Message Signatures](https://datatracker.ietf.org/doc/html/draft-ietf-httpbis-message-signatures) and [HTTP Message Signatures Directory](https://datatracker.ietf.org/doc/draft-meunier-http-message-signatures-directory/) specifications. It utilizes Cloudflare's Web Bot Auth libraries to create and verify cryptographic signatures for HTTP requests and responses.

### Key Features

- HTTP Message Signatures Directory endpoint (`.well-known/http-message-signatures-directory`)
- Ed25519 key pair generation for digital signatures
- API endpoint for web scraping with authenticated requests
- Frontend interface for testing signature verification and web scraping

## Project Structure

```
├── api/                   # Server-side code
│   ├── createKeys.js      # Script for generating Ed25519 key pairs
│   ├── getHeaders.js      # Utility for generating HTTP signature headers
│   ├── index.js           # Express server with API endpoints
│   ├── package.json       # Server dependencies
│   └── packages/          # Local packages
├── public/                # Client-side code
│   ├── index.html         # Main frontend page
│   ├── script.js          # Frontend JavaScript
│   └── styles.css         # CSS styling
├── package.json           # Project metadata and dependencies
└── vercel.json            # Vercel deployment configuration
```

## Prerequisites

- Node.js 18.0.0 or higher
- npm or yarn

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd cloudflare
   ```

2. Install dependencies:
   ```bash
   npm install
   cd api
   npm install
   ```

3. Generate Ed25519 key pairs:
   ```bash
   cd api
   node createKeys.js
   ```
   This will create:
   - `publicKey.json` - The public key for signature verification
   - `privateKey.json` - The private key for signing requests
   - Update the `.env` file with the private key parameter

## Usage

### Running the Application

Start the server:

```bash
npm start
```

The application will be available at `http://localhost:3000`.

### API Endpoints

#### 1. HTTP Message Signatures Directory

```
GET /.well-known/http-message-signatures-directory
```

Returns a directory of signature keys with appropriate signature headers according to the HTTP Message Signatures Directory specification.

#### 2. Web Scraper

```
POST /scrape
Content-Type: application/json

{
  "url": "https://example.com"
}
```

Fetches the content from the specified URL and returns it along with HTTP status and headers.

### Frontend Interface

The frontend provides a simple UI to:
- Test connections to URLs using the scraper API
- View the HTTP Message Signatures Directory
- Check signature headers

## Security

This application demonstrates the use of HTTP Message Signatures for secure API communication. In production environments, ensure:

1. Private keys are securely stored and never exposed
2. Use HTTPS for all API communications
3. Implement proper access controls and rate limiting

## Deployment

The project is configured for deployment on Vercel:

```bash
vercel
```

## Technologies Used

- **Backend**: Node.js, Express
- **Cryptography**: Ed25519, HTTP Message Signatures
- **Frontend**: HTML, CSS, JavaScript
- **Deployment**: Vercel

## Resources

- [HTTP Message Signatures Specification](https://datatracker.ietf.org/doc/html/draft-ietf-httpbis-message-signatures)
- [HTTP Message Signatures Directory Draft](https://datatracker.ietf.org/doc/draft-meunier-http-message-signatures-directory/)
- [Cloudflare Web Bot Auth](https://github.com/cloudflare/web-bot-auth)

## License

This project is licensed under the MIT License - see the LICENSE file for details.