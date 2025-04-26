// src/index.js  (ou src/api.js importado antes de usar axios)
import axios from 'axios';

// define o baseURL para todas as requests axios
axios.defaults.baseURL = process.env.REACT_APP_API_URL;
