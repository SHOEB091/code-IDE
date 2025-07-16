const userModel = require("../models/userModel");
const projectModel = require("../models/projectModel");
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
require('dotenv').config();
const fetch = require('node-fetch');

const secret = process.env.JWT_SECRET;

function getStartupCode(language) {
  if (language.toLowerCase() === "python") {
    return 'print("Hello World")';
  } else if (language.toLowerCase() === "java") {
    return 'public class Main { public static void main(String[] args) { System.out.println("Hello World"); } }';
  } else if (language.toLowerCase() === "javascript") {
    return 'console.log("Hello World");';
  } else if (language.toLowerCase() === "cpp") {
    return '#include <iostream>\n\nint main() {\n    std::cout << "Hello World" << std::endl;\n    return 0;\n}';
  } else if (language.toLowerCase() === "c") {
    return '#include <stdio.h>\n\nint main() {\n    printf("Hello World\\n");\n    return 0;\n}';
  } else if (language.toLowerCase() === "go") {
    return 'package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello World")\n}';
  } else if (language.toLowerCase() === "bash") {
    return 'echo "Hello World"';
  } else {
    return 'Language not supported';
  }
}
exports.signUp = async (req, res) => {
  try {

    let { email, pwd, name, phone, username, occupation } = req.body;

    let emailCon = await userModel.findOne({ email: email });
    if (emailCon) {
      return res.status(400).json({
        success: false,
        msg: "Email already exists"
      })
    }
    
    // Check if username is taken if provided
    if (username) {
      let usernameCon = await userModel.findOne({ username: username });
      if (usernameCon) {
        return res.status(400).json({
          success: false,
          msg: "Username already taken"
        })
      }
    }

    bcrypt.genSalt(12, function (err, salt) {
      bcrypt.hash(pwd, salt, async function (err, hash) {

        let user = await userModel.create({
          email: email,
          password: hash,
          fullName: name,
          phone: phone || "",
          username: username || "",
          occupation: occupation || ""
        });

        return res.status(200).json({
          success: true,
          msg: "User created successfully",
        });

      });
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      msg: error.message
    });
  }
};

exports.login = async (req, res) => {
  try {

    let { email, pwd } = req.body;

    let user = await userModel.findOne({ email: email });
    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found"
      });
    }

    bcrypt.compare(pwd, user.password, function (err, result) {
      if (result) {

        let token = jwt.sign({ userId: user._id }, secret)

        return res.status(200).json({
          success: true,
          msg: "User logged in successfully",
          token
        });
      }
      else {
        return res.status(401).json({
          success: false,
          msg: "Invalid password"
        });
      }
    })

  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: error.message
    })
  }
};

exports.createProj = async (req, res) => {
  try {
    let { name, projLanguage, token, version, runtime } = req.body;
    console.log("Creating project:", { name, projLanguage, version, runtime });
    
    let decoded = jwt.verify(token, secret);
    let user = await userModel.findOne({ _id: decoded.userId });

    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found"
      });
    };

    // Make sure we have appropriate versions for each language
    const versionMapping = {
      'javascript': '18.15.0',
      'python': '3.10.0',
      'cpp': '10.2.0',
      'c': '10.2.0',
      'java': '15.0.2',
      'bash': '5.2.0',
      'go': '1.16.2',
    };

    // Use the provided version or fall back to our known working version
    const finalVersion = version || versionMapping[projLanguage.toLowerCase()] || 'latest';
    
    // Create the project with all information
    let project = await projectModel.create({
      name: name,
      projLanguage: projLanguage,
      createdBy: user._id,
      code: getStartupCode(projLanguage),
      version: finalVersion,
      runtime: runtime || null
    });


    return res.status(200).json({
      success: true,
      msg: "Project created successfully",
      projectId: project._id
    });


  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: error.message
    })
  }
};

exports.saveProject = async (req, res) => {
  try {

    let { token, projectId, code } = req.body;
    console.log("DATA: ",token, projectId, code)
    let decoded = jwt.verify(token, secret);
    let user = await userModel.findOne({ _id: decoded.userId });

    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found"
      });
    };

    let project = await projectModel.findOneAndUpdate({ _id: projectId }, {code: code});

    return res.status(200).json({
      success: true,
      msg: "Project saved successfully"
    });

  } catch (error) {
    console.log(error)
    return res.status(500).json({
      success: false,
      msg: error.message
    })
  }
};

exports.getProjects = async (req, res) => {
  try {

    let { token } = req.body;
    let decoded = jwt.verify(token, secret);
    let user = await userModel.findOne({ _id: decoded.userId });

    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found"
      });
    }

    let projects = await projectModel.find({ createdBy: user._id });

    return res.status(200).json({
      success: true,
      msg: "Projects fetched successfully",
      projects: projects
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: error.message
    })
  }
};

exports.getProject = async (req, res) => {
  try {

    let { token, projectId } = req.body;
    let decoded = jwt.verify(token, secret);
    let user = await userModel.findOne({ _id: decoded.userId });

    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found"
      });
    }

    let project = await projectModel.findOne({ _id: projectId });

    if (project) {
      return res.status(200).json({
        success: true,
        msg: "Project fetched successfully",
        project: project
      });
    }
    else {
      return res.status(404).json({
        success: false,
        msg: "Project not found"
      });
    }

  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: error.message
    })
  }
};

exports.deleteProject = async (req, res) => {
  try {

    let { token, projectId } = req.body;
    let decoded = jwt.verify(token, secret);
    let user = await userModel.findOne({ _id: decoded.userId });

    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found"
      });
    }

    let project = await projectModel.findOneAndDelete({ _id: projectId });

    return res.status(200).json({
      success: true,
      msg: "Project deleted successfully"
    })

  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: error.message
    })
  }
};

exports.editProject = async (req, res) => {
  try {

    let {token, projectId, name} = req.body;
    let decoded = jwt.verify(token, secret);
    let user = await userModel.findOne({ _id: decoded.userId });

    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found"
      });
    };

    let project = await projectModel.findOne({ _id: projectId });
    if(project){
      project.name = name;
      await project.save();
      return res.status(200).json({
        success: true,
        msg: "Project edited successfully"
      })
    }
    else{
      return res.status(404).json({
        success: false,
        msg: "Project not found"
      })
    }

  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: error.message
    })
  }
};

// Add code execution proxy endpoint
exports.executeCode = async (req, res) => {
  try {
    const { code, language, version } = req.body;
    
    if (!code || !language) {
      return res.status(400).json({
        success: false,
        msg: "Missing required parameters (code or language)"
      });
    }
    
    // Map language to what Piston API expects
    const languageMapping = {
      'javascript': 'node-js', // Use node-js alias which is more reliable
      'python': 'python',
      'cpp': 'c++',
      'c': 'c',
      'java': 'java',
      'bash': 'bash',
      'go': 'go',
    };
    
    // Map appropriate versions for each language
    const versionMapping = {
      'javascript': '18.15.0', // Node.js stable version
      'python': '3.10.0',
      'cpp': '10.2.0',
      'c': '10.2.0',
      'java': '15.0.2',
      'bash': '5.2.0',
      'go': '1.16.2',
    };
    
    const apiLanguage = languageMapping[language.toLowerCase()] || language.toLowerCase();
    
    // Prepare the request payload
    const requestPayload = {
      language: apiLanguage,
      version: versionMapping[language.toLowerCase()] || version || 'latest',
      files: [
        {
          name: `main.${language === 'cpp' ? 'cpp' : language === 'python' ? 'py' : language === 'java' ? 'java' : language === 'c' ? 'c' : 'js'}`,
          content: code
        }
      ],
      stdin: '',
      args: [],
      compile_timeout: 10000,
      run_timeout: 5000
    };
    
    console.log("Executing code with payload:", JSON.stringify(requestPayload));
    
    // Call the Piston API
    const response = await fetch('https://emkc.org/api/v2/piston/execute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestPayload)
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log("Execution API response:", JSON.stringify(data));
      return res.status(200).json({
        success: true,
        result: data
      });
    } else {
      console.error("API error:", data);
      return res.status(response.status).json({
        success: false,
        msg: data.message || 'Error executing code',
        details: data
      });
    }
  } catch (error) {
    console.error('Code execution error:', error);
    return res.status(500).json({
      success: false,
      msg: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};