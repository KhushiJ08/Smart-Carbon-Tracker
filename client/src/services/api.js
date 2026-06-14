import axios from "axios";

const API = axios.create({
  baseURL: "https://smart-carbon-tracker-production.up.railway.app/api",
});

export default API;
