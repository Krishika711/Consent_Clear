import axios from "axios";
import { supabase } from "./lib/supabaseClient";

// In local dev, leave REACT_APP_API_URL unset — CRA's "proxy" in package.json
// forwards relative /api/* calls to localhost:5000 automatically.
// In production (Vercel), set REACT_APP_API_URL to the Render backend URL,
// e.g. https://consentclear-backend.onrender.com
const baseURL = process.env.REACT_APP_API_URL || "";

const api = axios.create({ baseURL });

// Attach the logged-in user's Supabase access token to every request, so the
// backend can tie scans/policies to a real user_id instead of saving them
// as anonymous. If there's no session, requests just go through without it.
api.interceptors.request.use(async (config) => {
  const { data } = await supabase.auth.getSession();
  const token = data?.session?.access_token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
