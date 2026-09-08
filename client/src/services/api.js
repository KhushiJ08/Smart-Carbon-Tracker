import axios from "axios";

const API = axios.create({
  baseURL: "https://smart-carbon-tracker-backend.onrender.com/api",
});

export default API;
