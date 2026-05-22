import axios from 'axios';

const BASE_URL = 'http://localhost:4941/api/v1';

const api = axios.create({
    baseURL: BASE_URL,
});

export default api;