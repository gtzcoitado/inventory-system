// src/api.js
import axios from 'axios';

const base = process.env.REACT_APP_API_URL;  
// → make sure REACT_APP_API_URL is defined in .env.local

axios.defaults.baseURL = base;
axios.defaults.withCredentials = true;      // if you use cookies
export default axios;
