import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Select from "react-select";
import { api_base_url } from "../helper";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { BackgroundBeamsWithCollision } from "../components/ui/background-beams-with-collision";

const Home = () => {
  const [isCreateModelShow, setIsCreateModelShow] = useState(false);
  const [languageOptions, setLanguageOptions] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [name, setName] = useState("");
  const [projects, setProjects] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");
  const navigate = useNavigate();

  useEffect(() => {
    getProjects();
    getRunTimes();
  }, []);

  const getRunTimes = async () => {
    let res = await fetch("https://emkc.org/api/v2/piston/runtimes");
    let data = await res.json();
    const filteredLanguages = ["python", "javascript", "c", "c++", "java", "csharp"];
    const options = data
      .filter((runtime) => filteredLanguages.includes(runtime.language))
      .map((runtime) => ({
        label: `${runtime.language} (${runtime.version})`,
        value: runtime.language === "c++" ? "cpp" : runtime.language,
        version: runtime.version,
      }));
    setLanguageOptions(options);
  };

  const getProjects = async () => {
    fetch(api_base_url + "/getProjects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: localStorage.getItem("token") }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setProjects(data.projects);
        else toast.error(data.msg);
      });
  };

  const createProj = () => {
    fetch(api_base_url + "/createProj", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        projLanguage: selectedLanguage.value,
        token: localStorage.getItem("token"),
        version: selectedLanguage.version,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setName("");
          navigate("/editor/" + data.projectId);
        } else toast.error(data.msg);
      });
  };

  return (
    <>
      <Navbar theme={theme} setTheme={setTheme} />

      {/* Animated Background - Behind Everything */}
      <div className="absolute inset-0 -z-10">
        <BackgroundBeamsWithCollision />
      </div>

      {/* Content Container */}
      <div className="relative container mx-auto px-8 py-10">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-3xl font-semibold text-gray-900 dark:text-white">Hey! Dev, Let's Code</h3>
          <button
            onClick={() => setIsCreateModelShow(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg"
          >
            Create Project
          </button>
        </div>

        {/* Projects Section with Glass Morphism */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 
                     bg-white/10 dark:bg-white/20 backdrop-blur-lg p-6 rounded-xl shadow-xl"
        >
          {projects?.length > 0 ? (
            projects.map((project) => (
              <motion.div
                key={project._id}
                whileHover={{ scale: 1.05 }}
                className="bg-white/10 dark:bg-gray-700/20 backdrop-blur-md p-4 rounded-xl shadow-md flex flex-col gap-3"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{project.name}</h3>
                <p className="text-gray-600 dark:text-gray-300">{new Date(project.date).toDateString()}</p>
                <div className="flex justify-between">
                  <button onClick={() => navigate("/editor/" + project._id)} className="text-blue-500 dark:text-blue-300">
                    Edit
                  </button>
                  <button onClick={() => console.log("Delete project")} className="text-red-500 dark:text-red-300">
                    Delete
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            <p className="text-gray-600 dark:text-gray-300">No Projects Found</p>
          )}
        </motion.div>
      </div>
    </>
  );
};

export default Home;
