import axios from "axios";
const BASE_URL = import.meta.env.VITE_WP_DOMAIN;

// Path (or full URL) of the WPGraphQL endpoint, relative to VITE_WP_DOMAIN
export const GRAPHQL_ENDPOINT =
  import.meta.env.VITE_WP_GRAPHQL_ENDPOINT || "/graphql";

// Contact Form 7 form (hash id, e.g. "cddc821") that sends the notification email
export const CONTACT_FORM_ID = import.meta.env.VITE_CONTACT_FORM_ID || "";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
  withCredentials: false 
});

export default axiosInstance;

export { isAxiosError } from 'axios';
