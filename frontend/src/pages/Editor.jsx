import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Editor2 from '@monaco-editor/react';
import { useParams, useNavigate } from 'react-router-dom';
import { api_base_url } from '../helper';
import { toast } from 'react-toastify';
import Select from 'react-select';

const Editor = () => {
  const [code, setCode] = useState(""); // State to hold the code
  const { id } = useParams(); // Extract project ID from URL params
  const [output, setOutput] = useState("");
  const [error, setError] = useState(false);
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [useBackupAPI, setUseBackupAPI] = useState(false);
  const [languageOptions, setLanguageOptions] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [isUpdatingLang, setIsUpdatingLang] = useState(false);
  const navigate = useNavigate();

  // Fetch project data on mount
  useEffect(() => {
    setIsLoading(true);
    fetch(`${api_base_url}/getProject`, {
      mode: 'cors',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: localStorage.getItem('token'),
        projectId: id,
      }),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (data.success) {
          setCode(data.project.code); // Set the fetched code
          setData(data.project);
        } else {
          toast.error(data.msg || 'Failed to load project');
          if (data.msg === 'User not found') {
            // Redirect to login if unauthorized
            localStorage.removeItem('token');
            localStorage.removeItem('isLoggedIn');
            navigate('/login');
          }
        }
      })
      .catch((err) => {
        console.error('Error fetching project:', err);
        toast.error('Failed to load project. Please try again.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [id, navigate]);

  // Save project function
  const saveProject = () => {
    const trimmedCode = code?.toString().trim(); // Ensure code is a string and trimmed
    setIsSaving(true);

    fetch(`${api_base_url}/saveProject`, {
      mode: 'cors',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: localStorage.getItem('token'),
        projectId: id,
        code: trimmedCode, // Use the latest code state
      }),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (data.success) {
          toast.success(data.msg || 'Project saved');
        } else {
          toast.error(data.msg || 'Failed to save project');
          if (data.msg === 'User not found') {
            // Redirect to login if unauthorized
            localStorage.removeItem('token');
            localStorage.removeItem('isLoggedIn');
            navigate('/login');
          }
        }
      })
      .catch((err) => {
        console.error('Error saving project:', err);
        toast.error('Failed to save the project. Please try again.');
      })
      .finally(() => {
        setIsSaving(false);
      });
  };

  // Shortcut handler for saving with Ctrl+S
  const handleSaveShortcut = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault(); // Prevent browser's default save behavior
      saveProject(); // Call the save function
    }
  };

  // Add and clean up keyboard event listener
  useEffect(() => {
    window.addEventListener('keydown', handleSaveShortcut);
    return () => {
      window.removeEventListener('keydown', handleSaveShortcut);
    };
  }, [code]);

  // Function to get correct file extension based on language
  const getFileExtension = (language) => {
    const extensions = {
      python: '.py',
      java: '.java',
      javascript: '.js',
      c: '.c',
      cpp: '.cpp',
      bash: '.sh',
      go: '.go'
    };
    return extensions[language?.toLowerCase()] || '';
  };
  
  // Function to download the current file
  const downloadProject = () => {
    const fileName = `${data?.name || 'code'}${getFileExtension(data?.projLanguage)}`;
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('File downloaded');
  };

  // Get appropriate language name for APIs
  const getAPILanguageName = (language) => {
    const languageMapping = {
      'javascript': 'node-js',  // Use node-js alias which is more reliable
      'python': 'python',
      'cpp': 'c++',
      'c': 'c',
      'java': 'java',
      'bash': 'bash',
      'go': 'go',
    };
    return languageMapping[language?.toLowerCase()] || language?.toLowerCase();
  };
  
  // Get appropriate version for each language
  const getAPILanguageVersion = (language) => {
    const versionMapping = {
      'javascript': '18.15.0',  // Node.js stable version
      'python': '3.10.0',
      'cpp': '10.2.0',
      'c': '10.2.0',
      'java': '15.0.2',
      'bash': '5.2.0',
      'go': '1.16.2',
    };
    return versionMapping[language?.toLowerCase()];
  };
  
  // Try primary execution API through our backend proxy
  const executePrimaryAPI = () => {
    // Override the version with our known working version
    const specificVersion = getAPILanguageVersion(data.projLanguage);
    
    console.log(`Executing ${data.projLanguage} code with version: ${specificVersion || data.version || "latest"}`);
    
    return fetch(`${api_base_url}/execute`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        code: code,
        language: data.projLanguage,
        version: specificVersion || data.version || "latest"
      })
    });
  };
  
  // Try backup execution API
  const executeBackupAPI = () => {
    const apiLanguage = getAPILanguageName(data.projLanguage);
    
    // Using JDoodle API as an example (would need an API key in production)
    return fetch("https://judge0-ce.p.rapidapi.com/submissions", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "X-RapidAPI-Key": "PLACEHOLDER-FOR-DEMO-ONLY", // Replace with your actual key
        "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com"
      },
      body: JSON.stringify({
        language_id: getLanguageId(apiLanguage),
        source_code: code,
        stdin: ""
      })
    });
  };
  
  // Helper to get language ID for backup API
  const getLanguageId = (language) => {
    // Judge0 API language IDs
    const languageIds = {
      'javascript': 63, // Node.js
      'python3': 71,
      'cpp': 54, // C++ GCC
      'c': 50,   // C GCC
      'java': 62, // OpenJDK
      'bash': 46,
      'go': 60
    };
    return languageIds[language] || 71; // Default to Python 3
  };
  
  // Run project function
  const runProject = () => {
    if (!data || !data.projLanguage) {
      toast.error('Project data is missing.');
      return;
    }

    setIsRunning(true);
    setOutput("Running code...");
    
    const executionAPI = useBackupAPI ? executeBackupAPI : executePrimaryAPI;
    
    executionAPI()
      .then(res => {
        if (!res.ok) {
          // If primary API fails and we haven't tried backup yet
          if (!useBackupAPI) {
            setUseBackupAPI(true);
            throw new Error('Trying backup execution service...');
          }
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(response => {
        console.log("API response:", response);
        
        if (useBackupAPI) {
          // Handle backup API response format (Judge0)
          handleBackupAPIResponse(response);
        } else {
          // Handle primary API response format (Piston)
          handlePrimaryAPIResponse(response);
        }
      })
      .catch(err => {
        console.error('Error executing code:', err);
        
        // If primary API failed and we haven't tried backup yet
        if (!useBackupAPI && err.message === 'Trying backup execution service...') {
          toast.info('Primary code execution service failed. Trying backup service...');
          runProject(); // Try again with backup API
          return;
        }
        
        // Debug info
        const debugInfo = {
          language: getAPILanguageName(data.projLanguage),
          version: getAPILanguageVersion(data.projLanguage) || data.version || "latest",
          useBackupAPI,
          error: err.message
        };
        console.log('Debug info for API call:', debugInfo);
        
        // Provide specific guidance for the javascript-1.0.0 runtime error
        let errorMessage = `Failed to execute code: ${err.message}\n\n`;
        
        if (err.message.includes('javascript-1.0.0') || err.message.includes('runtime is unknown')) {
          errorMessage += "The version of JavaScript specified is not supported by the execution service. " +
                          "Please try with a different JavaScript version or try again later.";
        } else {
          errorMessage += `Possible issues:\n- The execution API may be down or unreachable\n` +
                          `- The language '${data.projLanguage}' may not be supported\n` +
                          `- The code may be invalid or have syntax errors`;
        }
        
        setOutput(errorMessage);
        setError(true);
        toast.error('Failed to execute code. Please try again.');
        setIsRunning(false);
      });
  };
  
  // Handle response from our backend proxy API
  const handlePrimaryAPIResponse = (response) => {
    if (response.success && response.result) {
      // Extract the run information from the result
      const run = response.result.run;
      
      if (run) {
        setOutput(run.output || "No output");
        setError(run.code !== 0);
        if (run.code !== 0) {
          toast.warning('Code executed with errors');
        } else {
          toast.success('Code executed successfully');
        }
      } else if (response.result.message) {
        setOutput(`API Error: ${response.result.message}`);
        setError(true);
        toast.error(response.result.message || 'Failed to execute code');
      } else {
        setOutput("Execution completed but no output was generated.");
        setError(false);
      }
    } else if (!response.success) {
      setOutput(`Error: ${response.msg || "Unknown error occurred"}`);
      setError(true);
      toast.error(response.msg || 'Failed to execute code');
    } else {
      setOutput("Execution failed. Unexpected response format.");
      setError(true);
      toast.error('Failed to execute code');
    }
    setIsRunning(false);
  };
  
  // Handle response from backup API (Judge0)
  const handleBackupAPIResponse = (response) => {
    if (response && response.token) {
      // Judge0 API requires a second call to get the result
      setTimeout(() => {
        fetch(`https://judge0-ce.p.rapidapi.com/submissions/${response.token}`, {
          method: "GET",
          headers: {
            "X-RapidAPI-Key": "PLACEHOLDER-FOR-DEMO-ONLY", // Replace with your actual key
            "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com"
          }
        })
        .then(res => res.json())
        .then(result => {
          if (result.stdout) {
            setOutput(result.stdout);
            setError(false);
            toast.success('Code executed successfully');
          } else if (result.stderr) {
            setOutput(result.stderr);
            setError(true);
            toast.warning('Code executed with errors');
          } else if (result.compile_output) {
            setOutput(result.compile_output);
            setError(true);
            toast.warning('Compilation error');
          } else {
            setOutput("No output or error message received.");
            setError(false);
          }
          setIsRunning(false);
        })
        .catch(err => {
          console.error('Error fetching execution results:', err);
          setOutput(`Failed to fetch execution results: ${err.message}`);
          setError(true);
          toast.error('Failed to fetch execution results');
          setIsRunning(false);
        });
      }, 2000);
    } else {
      setOutput("Failed to submit code for execution.");
      setError(true);
      toast.error('Failed to execute code');
      setIsRunning(false);
    }
  };

  // Update project language
  const updateLanguage = (option) => {
    if (!option || !data) return;
    
    setIsUpdatingLang(true);
    setSelectedLanguage(option);
    
    fetch(`${api_base_url}/updateLanguage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId: id,
        token: localStorage.getItem("token"),
        projLanguage: option.value,
        version: option.version,
        runtime: option.runtime || option.value,
      }),
    })
      .then((res) => res.json())
      .then((response) => {
        if (response.success) {
          setData({
            ...data,
            projLanguage: option.value,
            version: option.version,
            runtime: option.runtime || option.value
          });
          
          // Update code with proper template for the selected language
          setCode(response.defaultCode || '');
          toast.success('Programming language updated');
        } else {
          toast.error(response.msg || 'Failed to update language');
        }
      })
      .catch((err) => {
        console.error('Error updating language:', err);
        toast.error('Failed to update language');
      })
      .finally(() => {
        setIsUpdatingLang(false);
      });
  };

  // Get language options
  const getLanguageOptions = () => {
    const options = [
      { label: "JavaScript (18.15.0)", value: "javascript", version: "18.15.0", runtime: "node" },
      { label: "Python (3.10.0)", value: "python", version: "3.10.0" },
      { label: "C++ (10.2.0)", value: "cpp", version: "10.2.0" },
      { label: "C (10.2.0)", value: "c", version: "10.2.0" },
      { label: "Java (15.0.2)", value: "java", version: "15.0.2" },
      { label: "Bash (5.2.0)", value: "bash", version: "5.2.0" },
    ];
    
    setLanguageOptions(options);
    
    // Set selected language based on project data
    if (data && data.projLanguage !== 'placeholder') {
      const currentLang = options.find(opt => opt.value === data.projLanguage);
      if (currentLang) {
        setSelectedLanguage(currentLang);
      }
    }
  };

  // Load language options when component mounts or data changes
  useEffect(() => {
    if (data) {
      getLanguageOptions();
    }
  }, [data]);

  if (isLoading) {
    return (
      <>
        <Navbar showLanguageSelector={false} />
        <div className="flex items-center justify-center" style={{ height: 'calc(100vh - 90px)' }}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4">Loading project...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar 
        showLanguageSelector={true}
        isPlaceholder={data?.projLanguage === 'placeholder'}
        languageOptions={languageOptions}
        selectedLanguage={selectedLanguage}
        updateLanguage={updateLanguage}
        isUpdatingLang={isUpdatingLang}
      />
      
      <div className="flex items-center justify-between" style={{ height: 'calc(100vh - 90px)' }}>
        <div className="left w-[50%] h-full">
          <div className="h-[40px] bg-[#1e1e1e] flex items-center justify-between px-4">
            <span className="text-white text-sm">
              {data?.name}{getFileExtension(data?.projLanguage)}
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={saveProject}
                disabled={isSaving}
                className={`px-2 py-1 rounded text-xs ${
                  isSaving 
                    ? 'bg-gray-500 cursor-not-allowed' 
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={downloadProject}
                className="px-2 py-1 rounded text-xs bg-blue-600 hover:bg-blue-700 text-white"
              >
                Download
              </button>
            </div>
          </div>
          <Editor2
            onChange={(newCode) => setCode(newCode || '')}
            theme="vs-dark"
            height="calc(100% - 40px)"
            width="100%"
            language={data?.projLanguage || 'python'}
            value={code}
            options={{
              minimap: { enabled: true },
              scrollBeyondLastLine: false,
              fontSize: 14,
              lineNumbers: 'on',
              automaticLayout: true,
              formatOnPaste: true,
              formatOnType: true,
              tabSize: 4,
              insertSpaces: true,
              detectIndentation: true,
              wordWrap: 'on',
              autoIndent: 'full',
              renderLineHighlight: 'all',
            }}
          />
        </div>
        <div className="right p-[15px] w-[50%] h-full bg-[#27272a]">
          <div className="flex pb-3 border-b-[1px] border-b-[#1e1e1f] items-center justify-between px-[30px]">
            <p className="p-0 m-0 text-white">Output</p>
            <button
              className={`btnNormal !w-fit !px-[20px] ${
                isRunning 
                  ? 'bg-gray-500 cursor-not-allowed' 
                  : 'bg-blue-500 hover:bg-blue-600'
              } transition-all`}
              onClick={runProject}
              disabled={isRunning}
            >
              {isRunning ? 'Running...' : 'Run'}
            </button>
          </div>
          <pre 
            className={`w-full h-[75vh] overflow-auto p-4 ${error ? "text-red-500" : "text-green-200"}`} 
            style={{ whiteSpace: "pre-wrap" }}
          >
            {output}
          </pre>
        </div>
      </div>
    </>
  );
};

export default Editor;
