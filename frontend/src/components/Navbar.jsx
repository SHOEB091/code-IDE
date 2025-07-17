import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Moon, Sun } from "lucide-react";
import logo from "../images/logos/logo.png";
import Select from "react-select";

const Navbar = ({ 
  languageOptions, 
  selectedLanguage, 
  updateLanguage, 
  isUpdatingLang, 
  showLanguageSelector = false,
  isPlaceholder = false
}) => {
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
      <div className="flex-1 flex justify-center gap-6 items-center">
        {showLanguageSelector ? (
          isPlaceholder ? (
            <div className="w-[300px] mx-auto">
              <div className="flex flex-col items-center">
                <h3 className="text-black dark:text-white text-center text-sm mb-1 font-medium">Select Programming Language</h3>
                <Select
                  placeholder="Choose language..."
                  options={languageOptions}
                  value={selectedLanguage}
                  onChange={updateLanguage}
                  isDisabled={isUpdatingLang}
                  className="w-full"
                  styles={{
                    control: (provided) => ({
                      ...provided,
                      backgroundColor: darkMode ? '#333' : '#f0f0f0',
                      borderColor: darkMode ? '#555' : '#ccc',
                      color: darkMode ? '#fff' : '#000',
                    }),
                    menu: (provided) => ({
                      ...provided,
                      backgroundColor: darkMode ? '#222' : '#fff',
                    }),
                    option: (provided, state) => ({
                      ...provided,
                      backgroundColor: state.isFocused 
                        ? (darkMode ? '#444' : '#f0f0f0') 
                        : (darkMode ? '#222' : '#fff'),
                      color: darkMode ? '#fff' : '#000',
                    }),
                    singleValue: (provided) => ({
                      ...provided,
                      color: darkMode ? '#fff' : '#000',
                    }),
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-black'}`}>Language:</span>
              <Select
                value={selectedLanguage}
                onChange={updateLanguage}
                options={languageOptions}
                isDisabled={isUpdatingLang}
                className="w-[200px]"
                styles={{
                  control: (provided) => ({
                    ...provided,
                    backgroundColor: darkMode ? '#333' : '#f0f0f0',
                    borderColor: darkMode ? '#555' : '#ccc',
                    minHeight: '35px',
                  }),
                  valueContainer: (provided) => ({
                    ...provided,
                    padding: '0 8px',
                  }),
                  menu: (provided) => ({
                    ...provided,
                    backgroundColor: darkMode ? '#222' : '#fff',
                  }),
                  option: (provided, state) => ({
                    ...provided,
                    backgroundColor: state.isFocused 
                      ? (darkMode ? '#444' : '#f0f0f0') 
                      : (darkMode ? '#222' : '#fff'),
                    color: darkMode ? '#fff' : '#000',
                  }),
                  singleValue: (provided) => ({
                    ...provided,
                    color: darkMode ? '#fff' : '#000',
                  }),
                }}
              />
            </div>
          )
        ) : (
          getNavLinks()
        )}
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
