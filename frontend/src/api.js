const base = process.env.REACT_APP_API_URL;
console.log('🚀 REACT_APP_API_URL =', base);
axios.defaults.baseURL = base;
