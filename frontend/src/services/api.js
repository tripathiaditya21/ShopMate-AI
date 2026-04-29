import axios from 'axios';

const API_URL = 'http://localhost:8000';

export const sendChatMessage = async (query, preferences = {}) => {
  try {
    const response = await axios.post(`${API_URL}/chat`, { query, preferences });
    return response.data;
  } catch (error) {
    console.error("Error communicating with backend:", error);
    throw error;
  }
};

export const signupUser = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/auth/signup`, { email, password });
    return response.data;
  } catch (error) {
    throw error.response?.data?.detail || "Signup failed";
  }
};

export const signinUser = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/auth/signin`, { email, password });
    return response.data;
  } catch (error) {
    throw error.response?.data?.detail || "Signin failed";
  }
};

export const sendOTP = async (email) => {
  try {
    const response = await axios.post(`${API_URL}/auth/send-otp`, { email });
    return response.data;
  } catch (error) {
    throw error.response?.data?.detail || "Failed to send OTP";
  }
};

export const verifyOTP = async (email, otp) => {
  try {
    const response = await axios.post(`${API_URL}/auth/verify-otp`, { email, otp });
    return response.data;
  } catch (error) {
    throw error.response?.data?.detail || "Failed to verify OTP";
  }
};
