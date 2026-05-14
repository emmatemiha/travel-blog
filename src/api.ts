import axios from 'axios';

const BASE_URL = 'https://seng365.csse.canterbury.ac.nz/api/v1';

const api = axios.create({
    baseURL: BASE_URL,
});

export default api;