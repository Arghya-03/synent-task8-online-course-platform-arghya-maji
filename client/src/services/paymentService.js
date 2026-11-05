import axios from "axios";

const API_URL = "http://localhost:5000/api/enrollments";

const getAuthConfig = () => {
  const token = localStorage.getItem("token");

  return {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
};

export const createPaymentOrder = async (courseId) => {
  const response = await axios.post(
    `${API_URL}/create-order`,
    { courseId },
    getAuthConfig()
  );

  return response.data;
};

export const verifyPayment = async (paymentData) => {
  const response = await axios.post(
    `${API_URL}/verify-payment`,
    paymentData,
    getAuthConfig()
  );

  return response.data;
};