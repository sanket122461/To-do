import axios from 'axios';
const API_URL = 'http://localhost/collab-todo/backend/api';
export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});
