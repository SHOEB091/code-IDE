// API configuration
// API URL configuration
export const api_base_url = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Add other helper functions below
export const fetchWithAuth = async (endpoint, method = 'GET', body = null) => {
  const token = localStorage.getItem('token');
  
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    mode: 'cors',
  };

  if (body) {
    options.body = JSON.stringify({
      ...body,
      token,
    });
  } else if (method !== 'GET') {
    options.body = JSON.stringify({ token });
  }

  try {
    const response = await fetch(`${api_base_url}${endpoint}`, options);
    
    if (!response.ok) {
      // Handle unauthorized access
      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('isLoggedIn');
        window.location.href = '/login';
        throw new Error('Authentication failed. Please log in again.');
      }
      
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// Helper to check if user is logged in
export const isUserLoggedIn = () => {
  return !!localStorage.getItem('token') && !!localStorage.getItem('isLoggedIn');
};