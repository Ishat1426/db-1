import { useState } from 'react';
import axios from 'axios';

// Base API URL
const API_URL = 'http://localhost:5007/api';

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getAuthConfig = () => {
    const token = localStorage.getItem('token');
    console.log('API request with token:', token ? 'Token present' : 'No token');
    return {
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token,
        'Authorization': `Bearer ${token}`
      }
    };
  };

  const makeRequest = async (method, endpoint, data = null, includeAuth = false) => {
    setLoading(true);
    setError(null);
    
    try {
      const config = includeAuth ? getAuthConfig() : { headers: { 'Content-Type': 'application/json' } };
      let response;
      
      switch (method.toLowerCase()) {
        case 'get':
          response = await axios.get(`${API_URL}/${endpoint}`, config);
          break;
        case 'post':
          response = await axios.post(`${API_URL}/${endpoint}`, data, config);
          break;
        case 'put':
          response = await axios.put(`${API_URL}/${endpoint}`, data, config);
          break;
        case 'delete':
          response = await axios.delete(`${API_URL}/${endpoint}`, config);
          break;
        default:
          throw new Error(`Unsupported method: ${method}`);
      }
      
      setLoading(false);
      return response.data;
    } catch (err) {
      setLoading(false);
      const errorMessage = err.response?.data?.message || err.message || 'Something went wrong';
      setError(errorMessage);
      console.error('API Error:', err.response?.data || err.message);
      throw new Error(errorMessage);
    }
  };

  // Auth endpoints
  const register = (userData) => makeRequest('post', 'auth/register', userData);
  
  const login = (credentials) => {
    console.log('API login called with:', credentials);
    return makeRequest('post', 'auth/login', credentials);
  };
  const getProfile = () => makeRequest('get', 'auth/profile', null, true);
  const updateProfile = (userData) => makeRequest('put', 'auth/profile', userData, true);

  // Workout endpoints
  const getAllWorkouts = () => makeRequest('get', 'workouts');
  const getWorkoutById = (id) => makeRequest('get', `workouts/${id}`);
  const getWorkoutsByCategory = (category) => makeRequest('get', `workouts/category/${category}`);
  const getWorkoutsByDifficulty = (difficulty) => makeRequest('get', `workouts/difficulty/${difficulty}`);
  const getWorkoutsByCategoryAndDifficulty = (category, difficulty) => 
    makeRequest('get', `workouts/category/${category}/difficulty/${difficulty}`);
  const getFeaturedWorkouts = () => makeRequest('get', 'workouts/featured');
  const searchWorkouts = (query) => makeRequest('get', `workouts/search/${query}`);

  // Meal endpoints
  const getAllMeals = () => makeRequest('get', 'meals');
  const getMealById = (id) => makeRequest('get', `meals/${id}`);
  const getMealsByCategory = (category) => makeRequest('get', `meals/category/${category}`);
  const getMealsByType = (type) => makeRequest('get', `meals/type/${type}`);
  const getMealsByCategoryAndType = (category, type) => 
    makeRequest('get', `meals/category/${category}/type/${type}`);
  const getFeaturedMeals = () => makeRequest('get', 'meals/featured');
  const searchMeals = (query) => makeRequest('get', `meals/search/${query}`);

  // Progress endpoints (require authentication)
  const addWorkoutToHistory = (workoutId) => 
    makeRequest('post', 'progress/workouts', { workoutId }, true);
  const addMealToHistory = (mealId) => 
    makeRequest('post', 'progress/meals', { mealId }, true);
  const getWorkoutHistory = () => makeRequest('get', 'progress/workouts', null, true);
  const getMealHistory = () => makeRequest('get', 'progress/meals', null, true);
  const getProgressSummary = () => makeRequest('get', 'progress/summary', null, true);

  // User favorites
  const addWorkoutToFavorites = (workoutId) => 
    makeRequest('post', `users/favorites/workouts/${workoutId}`, null, true);
  const removeWorkoutFromFavorites = (workoutId) => 
    makeRequest('delete', `users/favorites/workouts/${workoutId}`, null, true);
  const addMealToFavorites = (mealId) => 
    makeRequest('post', `users/favorites/meals/${mealId}`, null, true);
  const removeMealFromFavorites = (mealId) => 
    makeRequest('delete', `users/favorites/meals/${mealId}`, null, true);
    
  // Payment related
  const createOrder = () => makeRequest('post', 'payments/create-order', null, true);
  const verifyPayment = (paymentData) => makeRequest('post', 'payments/verify', paymentData, true);
  const testUpgrade = () => makeRequest('post', 'payments/test-upgrade', null, true);

  return {
    loading,
    error,
    // Auth
    register,
    login,
    getProfile,
    updateProfile,
    // Workouts
    getAllWorkouts,
    getWorkoutById,
    getWorkoutsByCategory,
    getWorkoutsByDifficulty,
    getWorkoutsByCategoryAndDifficulty,
    getFeaturedWorkouts,
    searchWorkouts,
    // Meals
    getAllMeals,
    getMealById,
    getMealsByCategory,
    getMealsByType,
    getMealsByCategoryAndType,
    getFeaturedMeals,
    searchMeals,
    // Progress
    addWorkoutToHistory,
    addMealToHistory,
    getWorkoutHistory,
    getMealHistory,
    getProgressSummary,
    // Favorites
    addWorkoutToFavorites,
    removeWorkoutFromFavorites,
    addMealToFavorites,
    removeMealFromFavorites,
    // Payment
    createOrder,
    verifyPayment,
    testUpgrade
  };
};

export default useApi; 