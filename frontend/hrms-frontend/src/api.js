
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json"
  }
});

api.interceptors.request.use(
  (config) => {

    const user = localStorage.getItem("user");

    if (user) {

      try {

        const userData = JSON.parse(user);

        if (userData.token) {

          config.headers.Authorization =
            `Bearer ${userData.token}`;

        }

      } catch (error) {

        console.error(
          "Invalid user data in localStorage:",
          error
        );

      }

    }

    return config;
  },

  (error) => {
    return Promise.reject(error);
  }
);


api.interceptors.response.use(
  (response) => response,

  (error) => {

    if (error.response?.status === 401) {

      console.error(
        "401 Unauthorized - JWT missing or invalid"
      );

    }

    if (error.response?.status === 403) {

      console.error(
        "403 Forbidden - User is not authorized"
      );

    }

    return Promise.reject(error);
  }
);


export default api;
