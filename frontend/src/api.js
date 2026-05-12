import axios from "axios";
import { getToken } from "./lib/authStorage";
import { beginRequest, endRequest } from "./lib/requestLoading";

const api = axios.create({
  baseURL: "http://localhost:8080/api",
});

api.interceptors.request.use(
  (config) => {
    beginRequest();
    const token = getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => {
    endRequest();
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    endRequest();
    return response;
  },
  (error) => {
    endRequest();
    return Promise.reject(error);
  }
);

export default api;
