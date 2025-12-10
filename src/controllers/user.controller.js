const UserModel = require("../models/User.model.js");
const bcrypt = require("bcrypt");
const {
  validateSignUpData,
  validateEditProfileData,
} = require("../utils/validations.util.js");
const jwt = require("jsonwebtoken");

const createUser = async (req, res) => {
  try {
    validateSignUpData(req);
    const {
      firstName,
      lastName,
      emailId,
      password,
      skills,
      age,
      gender,
      about,
    } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new UserModel({
      firstName,
      lastName,
      emailId,
      password: hashedPassword,
      skills,
      age,
      gender,
      about,
    });

    const savedUser = await user.save();
    res.json({ message: "User Added successfully!", data: savedUser });
  } catch (err) {
    res.status(400).send("ERROR : " + err.message);
  }
};

const loginUser = async (req, res) => {
  try {
    const { emailId, password } = req.body;

    const user = await UserModel.findOne({ emailId: emailId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const isMatch = await user.validatePassword(password);

    if (isMatch) {
      const token = await user.getJwtToken();

      res.cookie("token", token);
    }

    if (!isMatch) {
      return res
        .status(400)
        .json({
          message:
            "Invalid login credentials. Check your details and try again",
        });
    }

    res.json({
      message: "Login successful",
      data: user,
    });

    // res.redirect("/")

    
  } catch (err) {
    res.status(400).send("ERROR : " + err.message);
  }
};

const logoutUser = async (req, res) => {
  console.log("Logout called");
  res.cookie("token", null, {
    expires: new Date(Date.now()),
  });
  res.send("Logout Successful!!");
};

const getProfile = async (req, res) => {
  try {
    const user = req.user;

    res.json({
      message: "Profile fetched successful",
      data: user,
    });
  } catch (err) {
    res.status(400).send("ERROR : " + err.message);
  }
};

const editProfile = async (req, res) => {
  try {
    if (!validateEditProfileData(req)) {
      throw new Error("Invalid Edit Request");
    }

    const loggedInUser = req.user;

    Object.keys(req.body).forEach((key) => (loggedInUser[key] = req.body[key]));

    await loggedInUser.save();

    res.json({
      message: `${loggedInUser.firstName}, your profile updated successfuly`,
      data: loggedInUser,
    });
  } catch (error) {
    res.status(400).send("ERROR : " + error.message);
  }
};

const getallUsers = async (req, res) => {
  try {
    const users = await UserModel.find();

    res.json({ message: "Users found successfully", data: users });
  } catch (err) {
    res.status(400).send("ERROR : " + err.message);
  }
};

const getSingleUser = async (req, res) => {
  try {
    const { emailId } = req.params;

    const singleUser = await UserModel.findOne({ emailId });

    res.json({ message: "Users found successfully", data: singleUser });
  } catch (err) {
    res.status(400).send("ERROR : " + err.message);
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const { firstName, lastName, emailId, password, skills, age, gender } =
      req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    if (skills.length > 5) {
      return res.status(400).json({ message: "Skills should be less than 5" });
    }

    const updatedUser = await UserModel.findOneAndUpdate(
      { _id: id },
      {
        firstName,
        lastName,
        password: hashedPassword,
        emailId,
        skills,
        age,
        gender,
      },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User updated successfully", data: updatedUser });
  } catch (error) {
    res.status(400).send("ERROR : " + error.message);
  }
};

const deleteUser = async (req, res) => {
  try {
    const { emailId } = req.params;

    const deletedUser = await UserModel.deleteOne({ emailId });

    const getallUsers = await UserModel.find();

    res.json({ message: "User Deleted successfully", data: getallUsers });
  } catch (error) {
    res.status(400).send("ERROR : " + err.message);
  }
};

module.exports = {
  getSingleUser,
  getallUsers,
  createUser,
  loginUser,
  updateUser,
  deleteUser,
  getProfile,
  logoutUser,
  editProfile,
};
