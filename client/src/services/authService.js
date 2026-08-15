import axios from "axios";

const API_URL = "https://smart-carbon-tracker-backend.onrender.com/api/users/";

export const loginUser = async (data) => {
  const response = await axios.post(API_URL + "login", data);
  return response.data;
};

export const registerUser = async (data) => {
  const response = await axios.post(API_URL + "register", data);
  return response.data;
};
