import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Moon, Sun } from "lucide-react";
import logo from "../images/logos/logo.png";

const Navbar = () => {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("theme") === "dark");
  const location = useLocation();
  const isLoggedIn = localStorage.getItem("isLoggedIn");

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      document.body.style.backgroundColor = "black"; 
      document.body.style.color = "white";
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      document.body.style.backgroundColor = "white"; 
      document.body.style.color = "black";
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  // Determine which navigation links to show based on authentication and current route
  const getNavLinks = () => {
    // If user is on the editor page, show different navigation
    if (location.pathname.includes('/editor/')) {
      return (
        <>
          <Link 
            to="/"
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-black dark:text-white font-medium transition-all 
            hover:bg-blue-500 hover:text-white hover:border-blue-500 dark:hover:bg-blue-600"
          >
            Dashboard
          </Link>
        </>
      );
    }
    
    // Regular navigation for logged-in users
    if (isLoggedIn) {
      return (
        <>
          <Link 
            to="/"
            className={`px-4 py-2 border ${location.pathname === '/' ? 'bg-blue-500 text-white' : 'border-gray-300 dark:border-gray-600 text-black dark:text-white'} rounded-md font-medium transition-all 
            hover:bg-blue-500 hover:text-white hover:border-blue-500 dark:hover:bg-blue-600`}
          >
            Projects
          </Link>
        </>
      );
    }
    
    // Navigation for logged-out users
    return (
      <>
        <Link 
          to="/login"
          className={`px-4 py-2 border ${location.pathname === '/login' ? 'bg-blue-500 text-white' : 'border-gray-300 dark:border-gray-600 text-black dark:text-white'} rounded-md font-medium transition-all 
          hover:bg-blue-500 hover:text-white hover:border-blue-500 dark:hover:bg-blue-600`}
        >
          Login
        </Link>
        <Link 
          to="/signup"
          className={`px-4 py-2 border ${location.pathname === '/signup' ? 'bg-blue-500 text-white' : 'border-gray-300 dark:border-gray-600 text-black dark:text-white'} rounded-md font-medium transition-all 
          hover:bg-blue-500 hover:text-white hover:border-blue-500 dark:hover:bg-blue-600`}
        >
          Sign Up
        </Link>
      </>
    );
  };

  return (
    <div className="nav flex px-6 md:px-16 items-center justify-between h-[80px] bg-white dark:bg-black shadow-md transition-all duration-300 rounded-lg">
      
      {/* Logo with link to home */}
      <Link to="/">
        <img 
          src={logo} 
          className="w-[50px] h-[50px] object-cover rounded-full border-2 border-gray-700 dark:border-gray-300" 
          alt="Logo" 
        />
      </Link>
      
      {/* Navigation Links - Centered */}
      <div className="flex-1 flex justify-center gap-6">
        {getNavLinks()}
      </div>

      {/* Logout & Dark Mode - Aligned to Right */}
      <div className="flex items-center gap-4">
        {isLoggedIn && (
          <button 
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("isLoggedIn");
              window.location.href = "/login";
            }}
            className="bg-red-500 transition-all hover:bg-red-600 px-4 py-1 rounded text-white"
          >
            Logout
          </button>
        )}

        <button 
          onClick={() => setDarkMode(!darkMode)} 
          className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 transition-all"
          aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {darkMode ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-gray-800" />}
        </button>
      </div>
    </div>
  );
};

export default Navbar;
