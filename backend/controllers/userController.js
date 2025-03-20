const userModel = require('../models/userModel');
const bcrypt = require('bcryptjs');

exports.signUp = async (req, res) => {
  try {
    let { email, pwd, fullName } = req.body;
    let emailCon = await userModel.findOne({ email: email });
    if (emailCon) {
      return res.status(400).json({
        success: false,
        msg: "User already exists"
      });
    }
    bcrypt.genSalt(12, (err, salt) => {
      if (err) throw err;
      bcrypt.hash(pwd, salt, async function (err, hash) {
        if (err) throw err;
        // Store hash in your password DB
        let user = await userModel.create({
          fullName: fullName,
          email: email,
          password: hash,
        });

        res.status(200).json({
          success: true,
          msg: "User created successfully",
          data: user
        });
      });
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      msg: error.message
    });
  }
};