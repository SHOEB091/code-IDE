import React, { useState } from "react";
import logo from "../images/logos/logo.png";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { api_base_url } from "../helper";
import { CardContainer, CardBody, CardItem } from "@/components/ui/3d-card";

const SignUp = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  const navigate = useNavigate();

  const submitForm = (e) => {
    e.preventDefault();
    fetch(api_base_url + "/signUp", {
      mode: "cors",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fullName,
        email,
        pwd,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          navigate("/login");
        } else {
          toast.error(data.msg);
        }
      });
  };

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen ${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-black"}`}>
      
      {/* Dark Mode Toggle Button */}
      <button 
        className="absolute top-5 right-5 px-4 py-2 bg-blue-500 text-white rounded-lg"
        onClick={() => setDarkMode(!darkMode)}
      >
        {darkMode ? "Light Mode" : "Dark Mode"}
      </button>

      {/* 3D Card Container */}
      <CardContainer>
        <CardBody>
          <form 
            onSubmit={submitForm} 
            className={`w-[25vw] h-auto flex flex-col items-center ${darkMode ? "bg-gray-800" : "bg-white"} p-[20px] rounded-lg shadow-xl`}
          >
            {/* Logo */}
            <CardItem translateZ={30}>
              <img className="w-[230px] object-cover" src={logo} alt="Logo" />
            </CardItem>

            {/* Full Name Input */}
            <CardItem translateZ={20}>
              <div className="inputBox">
                <input 
                  onChange={(e) => setFullName(e.target.value)} 
                  value={fullName} 
                  type="text" 
                  placeholder="Full Name" 
                  required 
                  className="px-3 py-2 w-full border rounded-md"
                />
              </div>
            </CardItem>

            {/* Email Input */}
            <CardItem translateZ={20}>
              <div className="inputBox">
                <input 
                  onChange={(e) => setEmail(e.target.value)} 
                  value={email} 
                  type="email" 
                  placeholder="Email" 
                  required 
                  className="px-3 py-2 w-full border rounded-md"
                />
              </div>
            </CardItem>

            {/* Password Input */}
            <CardItem translateZ={20}>
              <div className="inputBox">
                <input 
                  onChange={(e) => setPwd(e.target.value)} 
                  value={pwd} 
                  type="password" 
                  placeholder="Password" 
                  required 
                  className="px-3 py-2 w-full border rounded-md"
                />
              </div>
            </CardItem>

            {/* Already have an account? */}
            <CardItem translateZ={10}>
              <p className="text-gray-500 text-sm mt-3">
                Already have an account? <Link to="/login" className="text-blue-500">Login</Link>
              </p>
            </CardItem>

            {/* Sign Up Button */}
            <CardItem translateZ={30}>
              <button 
                type="submit" 
                className="btnNormal mt-3 bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600"
              >
                Sign Up
              </button>
            </CardItem>
          </form>
        </CardBody>
      </CardContainer>
    </div>
  );
};

export default SignUp;
