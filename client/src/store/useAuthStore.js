import { create } from 'zustand';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api/users/';

// Check if user is in local storage
const user = JSON.parse(localStorage.getItem('user'));

const useAuthStore = create((set) => ({
  user: user || null,
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',

  register: async (userData) => {
    set({ isLoading: true, isError: false, isSuccess: false, message: '' });
    try {
      const response = await axios.post(API_URL, userData);
      if (response.data) {
        localStorage.setItem('user', JSON.stringify(response.data));
        set({ user: response.data, isSuccess: true, isLoading: false });
      }
      return response.data;
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      set({
        isLoading: false,
        isError: true,
        message,
        user: null,
      });
      throw error;
    }
  },

  login: async (userData) => {
    set({ isLoading: true, isError: false, isSuccess: false, message: '' });
    try {
      const response = await axios.post(API_URL + 'login', userData);
      if (response.data) {
        localStorage.setItem('user', JSON.stringify(response.data));
        set({ user: response.data, isSuccess: true, isLoading: false });
      }
      return response.data;
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      set({
        isLoading: false,
        isError: true,
        message,
        user: null,
      });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('user');
    set({ user: null, isSuccess: false, isError: false, message: '' });
  },

  reset: () => {
    set({ isError: false, isSuccess: false, isLoading: false, message: '' });
  },
}));

export default useAuthStore;
