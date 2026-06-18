const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const getHeaders = (token, isJson = true) => {
  const headers = {};
  if (isJson) headers['Content-Type'] = 'application/json';
  if (token)  headers['Authorization'] = `Bearer ${token}`;
  return headers;
};

const handleResponse = async (res) => {
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Something went wrong');
  return data;
};

const api = {
  // Auth
  register: (name, email, password) =>
    fetch(`${BASE_URL}/api/users/register`, {
      method: 'POST', headers: getHeaders(null),
      body:   JSON.stringify({ name, email, password }),
    }).then(handleResponse),

  login: (email, password) =>
    fetch(`${BASE_URL}/api/users/login`, {
      method: 'POST', headers: getHeaders(null),
      body:   JSON.stringify({ email, password }),
    }).then(handleResponse),

  // User
  getProfile: (token) =>
    fetch(`${BASE_URL}/api/users/profile`, { headers: getHeaders(token) })
      .then(handleResponse),

  updateProfile: (token, data) =>
    fetch(`${BASE_URL}/api/users/profile`, {
      method: 'PUT', headers: getHeaders(token),
      body:   JSON.stringify(data),
    }).then(handleResponse),

  // Workouts — unwrap array from paginated response
  getWorkouts: async (token) => {
    const data = await fetch(`${BASE_URL}/api/workouts?limit=200`, {
      headers: getHeaders(token),
    }).then(handleResponse);
    // Support both old array response and new paginated response
    return Array.isArray(data) ? data : (data.workouts || []);
  },

  createWorkout: (token, data) =>
    fetch(`${BASE_URL}/api/workouts`, {
      method: 'POST', headers: getHeaders(token),
      body:   JSON.stringify(data),
    }).then(handleResponse),

  deleteWorkout: (token, id) =>
    fetch(`${BASE_URL}/api/workouts/${id}`, {
      method: 'DELETE', headers: getHeaders(token),
    }).then(handleResponse),

  // Nutrition — unwrap array from paginated response
  getMeals: async (token) => {
    const data = await fetch(`${BASE_URL}/api/nutrition?limit=200`, {
      headers: getHeaders(token),
    }).then(handleResponse);
    return Array.isArray(data) ? data : (data.meals || []);
  },

  createMeal: (token, data) =>
    fetch(`${BASE_URL}/api/nutrition`, {
      method: 'POST', headers: getHeaders(token),
      body:   JSON.stringify(data),
    }).then(handleResponse),

  deleteMeal: (token, id) =>
    fetch(`${BASE_URL}/api/nutrition/${id}`, {
      method: 'DELETE', headers: getHeaders(token),
    }).then(handleResponse),

  // Body Stats — unwrap array from paginated response
  getStats: async (token) => {
    const data = await fetch(`${BASE_URL}/api/stats?limit=200`, {
      headers: getHeaders(token),
    }).then(handleResponse);
    return Array.isArray(data) ? data : (data.stats || []);
  },

  createStat: (token, data) =>
    fetch(`${BASE_URL}/api/stats`, {
      method: 'POST', headers: getHeaders(token),
      body:   JSON.stringify(data),
    }).then(handleResponse),

  deleteStat: (token, id) =>
    fetch(`${BASE_URL}/api/stats/${id}`, {
      method: 'DELETE', headers: getHeaders(token),
    }).then(handleResponse),

  // Goals
  getGoals: (token) =>
    fetch(`${BASE_URL}/api/goals`, { headers: getHeaders(token) })
      .then(handleResponse),

  createGoal: (token, data) =>
    fetch(`${BASE_URL}/api/goals`, {
      method: 'POST', headers: getHeaders(token),
      body:   JSON.stringify(data),
    }).then(handleResponse),

  updateGoal: (token, id, data) =>
    fetch(`${BASE_URL}/api/goals/${id}`, {
      method: 'PUT', headers: getHeaders(token),
      body:   JSON.stringify(data),
    }).then(handleResponse),

  deleteGoal: (token, id) =>
    fetch(`${BASE_URL}/api/goals/${id}`, {
      method: 'DELETE', headers: getHeaders(token),
    }).then(handleResponse),

  // AI Coach
  askAI: (token, message, history) =>
    fetch(`${BASE_URL}/api/ai/chat`, {
      method: 'POST', headers: getHeaders(token),
      body:   JSON.stringify({ message, history }),
    }).then(handleResponse),
};

export default api;
export { BASE_URL };