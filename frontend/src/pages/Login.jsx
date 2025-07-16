import React, { useState } from 'react';
import logo from "../images/logos/logo.png";
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { api_base_url } from '../helper';
import BackgroundBeamsWithCollision from "../components/ui/background-beams-with-collision";

const Login = () => {
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const submitForm = (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    fetch(api_base_url + "/login", {
      mode: "cors",
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, pwd })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("isLoggedIn", true);
        
        if (rememberMe) {
          localStorage.setItem("rememberedEmail", email);
        } else {
          localStorage.removeItem("rememberedEmail");
        }
        
        toast.success("Login successful! Redirecting to dashboard...");
        setTimeout(() => {
          window.location.href = "/";
        }, 1000);
      } else {
        toast.error(data.msg);
      }
    })
    .catch(err => {
      console.error("Login error:", err);
      toast.error("An error occurred. Please try again.");
    })
    .finally(() => {
      setIsLoading(false);
    });
  };

  // Check for remembered email on component mount
  React.useEffect(() => {
    const rememberedEmail = localStorage.getItem("rememberedEmail");
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  return (
    <div className={`relative min-h-screen flex flex-col items-center justify-center py-6 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'}`}>
      {/* Background Animation */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <BackgroundBeamsWithCollision />
      </div>
      
      {/* Mode Toggle Button */}
      <button 
        className="absolute top-5 right-5 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-300 z-10"
        onClick={() => setDarkMode(!darkMode)}
      >
        {darkMode ? "Light Mode" : "Dark Mode"}
      </button>

      {/* Login Form */}
      <div className={`w-[90vw] md:w-[400px] flex flex-col items-center ${darkMode ? 'bg-gray-800/80' : 'bg-white/80'} backdrop-blur-lg p-6 rounded-xl shadow-xl animate-fade-in z-10`}>
        <div className="flex flex-col items-center mb-6">
          <img className='w-[100px] object-cover animate-pulse-slow' src={logo} alt="Logo" />
          <h2 className="text-2xl font-bold mt-2 text-center bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
            Welcome Back
          </h2>
        </div>

        <form onSubmit={submitForm} className="w-full">
          <div className="w-full mb-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <label className={`text-xs font-medium mb-1 block ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Email Address
            </label>
            <input 
              onChange={(e) => setEmail(e.target.value)} 
              value={email} 
              type="email" 
              placeholder='email@example.com' 
              required 
              className={`px-4 py-3 w-full border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700/80 text-white' : 'bg-white/80 text-gray-800'}`}
            />
          </div>

          <div className="w-full animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex justify-between items-center mb-1">
              <label className={`text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Password
              </label>
              <a href="#" className="text-xs text-blue-500 hover:text-blue-600">
                Forgot Password?
              </a>
            </div>
            <input 
              onChange={(e) => setPwd(e.target.value)} 
              value={pwd} 
              type="password" 
              placeholder='•••••••••••' 
              required 
              className={`px-4 py-3 w-full border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700/80 text-white' : 'bg-white/80 text-gray-800'}`}
            />
          </div>

          <div className="flex items-center mt-3 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <input 
              id="remember" 
              type="checkbox" 
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="remember" className={`ml-2 text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Remember me
            </label>
          </div>

          <div className="mt-6 w-full animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <button 
              type="submit" 
              disabled={isLoading}
              className={`w-full py-3 px-6 rounded-lg font-medium transition-all duration-300 ${
                isLoading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg hover:shadow-blue-500/30'
              } text-white`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Logging in...
                </span>
              ) : "Log In"}
            </button>
          </div>

          <div className="mt-4 w-full text-center animate-slide-up" style={{ animationDelay: '0.5s' }}>
            <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Don't have an account? <Link to="/signUp" className='text-blue-500 hover:text-blue-600 font-medium'>Sign Up</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;