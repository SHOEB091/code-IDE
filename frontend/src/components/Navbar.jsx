import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Moon, Sun } from "lucide-react";
import logo from "../images/logos/logo.png";

const Navbar = () => {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("theme") === "dark");

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

  return (
    <div className="nav flex px-6 md:px-16 items-center justify-between h-[80px] bg-white dark:bg-black shadow-md transition-all duration-300 rounded-lg">
      
      {/* Logo */}
      <img 
        src={logo} 
        className="w-[50px] h-[50px] object-cover rounded-full border-2 border-gray-700 dark:border-gray-300" 
        alt="Logo" 
      />
      
      {/* Navigation Links - Centered */}
      <div className="flex-1 flex justify-center gap-6">
        {["Home", "About", "Services", "Contact"].map((item) => (
          <Link 
            key={item}
            to={`/${item.toLowerCase()}`} 
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-black dark:text-white font-medium transition-all 
            hover:bg-blue-500 hover:text-white hover:border-blue-500 dark:hover:bg-blue-600"
          >
            {item}
          </Link>
        ))}
      </div>

      {/* Logout & Dark Mode - Aligned to Right */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("isLoggedIn");
            window.location.reload();
          }}
          className="bg-red-500 transition-all hover:bg-red-600 px-4 py-1 rounded text-white"
        >
          Logout
        </button>

        <button 
          onClick={() => setDarkMode(!darkMode)} 
          className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 transition-all"
        >
          {darkMode ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-gray-800" />}
        </button>
      </div>
    </div>
  );
};

export default Navbar;
