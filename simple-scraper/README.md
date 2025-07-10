# Simple Scraper

A simple Node.js backend application that can scrape content from a given URL using axios.

## Installation

```bash
npm install
```

## Usage

### API Server

Start the server:

```bash
npm start
# or
node index.js
```

The server will start on port 3001 (unless a different port is specified in the PORT environment variable).

### Command Line Interface

You can also use the CLI tool to scrape URLs directly from the terminal:

```bash
npm run scrape https://example.com
# or
node scrape-cli.js https://example.com
```

## API Endpoints

### GET /

Returns a simple message indicating the API is running.

### POST /scrape

Scrapes content from the provided URL.

**Request body:**

```json
{
  "url": "https://example.com"
}
```

**Response:**

```json
{
  "success": true,
  "url": "https://example.com",
  "status": 200,
  "headers": { /* Response headers */ },
  "contentLength": 12345,
  "data": "<!DOCTYPE html>..." // HTML content
}
```

## Error Handling

The API handles various error cases:
- Missing URL
- Invalid URL format
- Failed requests
- Timeouts

## Dependencies

- Express.js - Web server framework
- Axios - HTTP client for making requests

## Deployment

### Deploying to Vercel

This application is configured for seamless deployment to Vercel.

1. Install Vercel CLI (if not already installed):
```bash
npm install -g vercel
```

2. Login to your Vercel account:
```bash
vercel login
```

3. Deploy to Vercel:
```bash
vercel
```

4. For production deployment:
```bash
vercel --prod
```

After deployment, your application will be available at a URL provided by Vercel.

### Using the Deployed API

Once deployed, you can use the API by sending a POST request to:
```
https://your-vercel-url.vercel.app/scrape
```

With the following JSON body:
```json
{
  "url": "https://example.com"
}
```
