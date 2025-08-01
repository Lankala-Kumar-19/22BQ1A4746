# URL Shortener React App - Design Document

## Key Decisions

- **Client-side only:** The entire app, including data storage, runs on the client side using browser `localStorage` with no backend or server.
- **React Framework:** React was chosen for its component-based architecture and state management, enabling a responsive and interactive UI.
- **Material UI (MUI):** Used for styling and layout to provide a consistent, modern, and responsive design.
- **Routing:** React Router handles all page navigation including dynamic routes for shortcodes and stats page.

## Data Modeling

- Data is stored in `localStorage` as a JSON object keyed by shortcode.
- Each shortcode entry contains:
  - `originalUrl`: The full original URL.
  - `createdAt`: ISO string of creation timestamp.
  - `expiresAt`: ISO string of expiry timestamp.
  - `clicks`: An array of click objects, each with:
    - `timestamp`: When the click happened.
    - `referrer`: Source URL of the click.
    - `location`: Coarse geographic location (if available).

Example stored data:
```json
{
  "abc123": {
    "originalUrl": "https://example.com",
    "createdAt": "2025-08-01T10:00:00.000Z",
    "expiresAt": "2025-08-01T10:30:00.000Z",
    "clicks": [
      {
        "timestamp": "2025-08-01T10:15:00.000Z",
        "referrer": "https://google.com",
        "location": "New York, USA"
      }
    ]
  }
}
