import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Select from "react-select";
import { api_base_url } from "../helper";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import BackgroundBeamsWithCollision from "../components/ui/background-beams-with-collision";

const Home = () => {
  const [isCreateModelShow, setIsCreateModelShow] = useState(false);
  const [isEditModelShow, setIsEditModelShow] = useState(false);
  const [languageOptions, setLanguageOptions] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [name, setName] = useState("");
  const [projects, setProjects] = useState(null);
  const [editProjId, setEditProjId] = useState("");
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");
  const navigate = useNavigate();

  const customStyles = {
    control: (provided) => ({
      ...provided,
      backgroundColor: '#000',
      borderColor: '#555',
      color: '#fff',
      padding: '5px',
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: '#000',
      color: '#fff',
      width: "100%"
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused ? '#333' : '#000',
      color: '#fff',
      cursor: 'pointer',
    }),
    singleValue: (provided) => ({
      ...provided,
      color: '#fff',
    }),
    placeholder: (provided) => ({
      ...provided,
      color: '#aaa',
    }),
  };

  useEffect(() => {
    getProjects();
    getRunTimes();
  }, []);

  const getRunTimes = async () => {
    try {
      // Define known working versions for each language
      const knownWorkingVersions = {
        'javascript': '18.15.0',  // Node.js version
        'python': '3.10.0',
        'c++': '10.2.0',
        'c': '10.2.0',
        'java': '15.0.2',
        'bash': '5.2.0',
        'go': '1.16.2',
      };
      
      // Fetch all available runtimes
      let res = await fetch("https://emkc.org/api/v2/piston/runtimes");
      let data = await res.json();
      console.log("Available runtimes:", data);
      
      // Filter languages we support
      const filteredLanguages = ["python", "javascript", "c", "c++", "java", "bash", "go"];
      
      // Map aliases to their proper language names for filtering
      const aliasToLanguage = {
        'node-js': 'javascript',
        'node-javascript': 'javascript',
        'js': 'javascript',
        'py': 'python',
        'python3': 'python',
        'gcc': 'c',
        'g++': 'c++',
        'golang': 'go',
      };
      
      // Find appropriate runtime for each language
      const options = [];
      
      filteredLanguages.forEach(lang => {
        // Try to find the exact version we know works
        const exactMatch = data.find(runtime => 
          (runtime.language === lang || 
           (runtime.aliases && runtime.aliases.includes(lang)) || 
           (aliasToLanguage[runtime.language] === lang)) && 
          runtime.version === knownWorkingVersions[lang]
        );
        
        if (exactMatch) {
          options.push({
            label: `${lang} (${exactMatch.version})`,
            value: lang === "c++" ? "cpp" : lang,
            version: exactMatch.version,
            runtime: exactMatch.runtime || exactMatch.language
          });
          return;
        }
        
        // If exact version not found, find any version
        const anyVersion = data.find(runtime => 
          runtime.language === lang || 
          (runtime.aliases && runtime.aliases.includes(lang)) ||
          (aliasToLanguage[runtime.language] === lang)
        );
        
        if (anyVersion) {
          options.push({
            label: `${lang} (${anyVersion.version})`,
            value: lang === "c++" ? "cpp" : lang,
            version: anyVersion.version,
            runtime: anyVersion.runtime || anyVersion.language
          });
          return;
        }
        
        // Fallback to known working version if API doesn't return it
        if (knownWorkingVersions[lang]) {
          options.push({
            label: `${lang} (${knownWorkingVersions[lang]} - recommended)`,
            value: lang === "c++" ? "cpp" : lang,
            version: knownWorkingVersions[lang],
            runtime: lang === "javascript" ? "node" : lang
          });
        }
      });
      
      console.log("Created language options:", options);
      setLanguageOptions(options);
    } catch (error) {
      console.error("Error fetching runtimes:", error);
      toast.error("Could not load language options. Using defaults.");
      
      // Fallback options if API fails
      const fallbackOptions = [
        { label: "JavaScript (18.15.0)", value: "javascript", version: "18.15.0", runtime: "node" },
        { label: "Python (3.10.0)", value: "python", version: "3.10.0" },
        { label: "C++ (10.2.0)", value: "cpp", version: "10.2.0" },
        { label: "C (10.2.0)", value: "c", version: "10.2.0" },
        { label: "Java (15.0.2)", value: "java", version: "15.0.2" },
        { label: "Bash (5.2.0)", value: "bash", version: "5.2.0" },
        { label: "Go (1.16.2)", value: "go", version: "1.16.2", runtime: "go" }
      ];
      
      setLanguageOptions(fallbackOptions);
    }
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
    if (!name.trim()) {
      toast.error("Please enter a project name");
      return;
    }
    
    // Create project with temporary placeholder language, will be updated in editor
    fetch(api_base_url + "/createProj", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        projLanguage: "placeholder", // This will be updated in the editor
        token: localStorage.getItem("token"),
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

  const deleteProject = (id) => {
    if (confirm("Are you sure you want to delete this project?")) {
      fetch(api_base_url + "/deleteProject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: id,
          token: localStorage.getItem("token"),
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) getProjects();
          else toast.error(data.msg);
        });
    }
  };

  const updateProj = () => {
    fetch(api_base_url + "/editProject", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId: editProjId,
        token: localStorage.getItem("token"),
        name,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setIsEditModelShow(false);
          setName("");
          setEditProjId("");
          getProjects();
        } else {
          toast.error(data.msg);
        }
      });
  };

  return (
    <>
      <Navbar theme={theme} setTheme={setTheme} />
      <div className="absolute inset-0 -z-10">
        <BackgroundBeamsWithCollision />
      </div>

      <div className="relative container mx-auto px-8 py-10">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-3xl font-semibold text-gray-900 dark:text-white">Hey! Dev, Let's Code</h3>
          <button
            onClick={() => setIsCreateModelShow(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg"
          >
            Create Project
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
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
                  <button
                    onClick={() => navigate("/editor/" + project._id)}
                    className="text-blue-500 dark:text-blue-300"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      setIsEditModelShow(true);
                      setEditProjId(project._id);
                      setName(project.name);
                    }}
                    className="text-yellow-500 dark:text-yellow-300"
                  >
                    Rename
                  </button>
                  <button
                    onClick={() => deleteProject(project._id)}
                    className="text-red-500 dark:text-red-300"
                  >
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

      {isCreateModelShow && (
        <div
          onClick={(e) => {
            if (e.target.classList.contains("modelCon")) {
              setIsCreateModelShow(false);
              setName("");
            }
          }}
          className='modelCon flex items-center justify-center fixed top-0 left-0 w-screen h-screen bg-[rgba(0,0,0,0.5)] z-50'
        >
          <div className="modelBox bg-[#0F0E0E] p-6 rounded-lg w-[90%] sm:w-[400px]">
            <h3 className='text-xl font-bold mb-4 text-white'>Create Project</h3>
            <input
              onChange={(e) => setName(e.target.value)}
              value={name}
              type="text"
              placeholder='Enter project name'
              className="w-full p-2 rounded text-black mb-4"
            />
            <button
              onClick={createProj}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 mt-2 rounded w-full"
            >
              Create
            </button>
          </div>
        </div>
      )}

      {isEditModelShow && (
        <div
          onClick={(e) => {
            if (e.target.classList.contains("modelCon")) {
              setIsEditModelShow(false);
              setName("");
            }
          }}
          className='modelCon flex items-center justify-center fixed top-0 left-0 w-screen h-screen bg-[rgba(0,0,0,0.5)] z-50'
        >
          <div className="modelBox bg-[#0F0E0E] p-6 rounded-lg w-[90%] sm:w-[400px]">
            <h3 className='text-xl font-bold mb-4 text-white'>Update Project Name</h3>
            <input
              onChange={(e) => setName(e.target.value)}
              value={name}
              type="text"
              placeholder='Enter new project name'
              className="w-full p-2 rounded text-black mb-4"
            />
            <button
              onClick={updateProj}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              Update
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Home;
