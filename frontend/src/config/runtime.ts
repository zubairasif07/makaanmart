const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();

export const API_URL = configuredApiUrl
  ? configuredApiUrl.replace(/\/+$/, '')
  : '/api';

export const IS_DEMO_MODE = import.meta.env.PROD && !configuredApiUrl;
