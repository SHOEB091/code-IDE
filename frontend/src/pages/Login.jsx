import React, { useState } from 'react';
import logo from "../images/logos/logo.png";
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { api_base_url } from '../helper';
import { CardContainer, CardBody, CardItem } from "@/components/ui/3d-card";
import BackgroundBeamsWithCollision from "../components/ui/background-beams-with-collision";

const Login = () => {
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  const navigate = useNavigate();

  const submitForm = (e) => {
    e.preventDefault();
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
        window.location.href = "/";
      } else {
        toast.error(data.msg);
      }
    });
  };

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'}`}>
      <button 
        className="absolute top-5 right-5 px-4 py-2 bg-blue-500 text-white rounded-lg"
        onClick={() => setDarkMode(!darkMode)}
      >
        {darkMode ? "Light Mode" : "Dark Mode"}
      </button>

      {/* Animated Background - Behind Everything */}
      <div className="absolute inset-0 -z-10">
        <BackgroundBeamsWithCollision />
      </div>

      <CardContainer>
        <CardBody>
          <form 
            onSubmit={submitForm} 
            className={`w-[25vw] h-auto flex flex-col items-center ${darkMode ? 'bg-gray-800' : 'bg-white'} p-[20px] rounded-lg shadow-xl`}
          >
            <CardItem translateZ={30}>
              <img className='w-[230px] object-cover' src={logo} alt="" />
            </CardItem>

            <CardItem translateZ={20}>
              <div className="inputBox">
                <input 
                  onChange={(e) => setEmail(e.target.value)} 
                  value={email} 
                  type="email" 
                  placeholder='Email' 
                  required 
                  className="px-3 py-2 w-full border rounded-md"
                />
              </div>
            </CardItem>

            <CardItem translateZ={20}>
              <div className="inputBox">
                <input 
                  onChange={(e) => setPwd(e.target.value)} 
                  value={pwd} 
                  type="password" 
                  placeholder='Password' 
                  required 
                  className="px-3 py-2 w-full border rounded-md"
                />
              </div>
            </CardItem>

            <CardItem translateZ={10}>
              <p className='text-gray-500 text-sm mt-3'>
                Don't have an account? <Link to="/signUp" className='text-blue-500'>Sign Up</Link>
              </p>
            </CardItem>

            <CardItem translateZ={30}>
              <button 
                type="submit" 
                className="btnNormal mt-3 bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600"
              >
                Login
              </button>
            </CardItem>
          </form>
        </CardBody>
      </CardContainer>
    </div>
  );
}

export default Login;