// ── Base URL ──
// Set REACT_APP_API_URL in your .env file for staging / production.
// Falls back to localhost for local development.
const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export default BASE_URL;