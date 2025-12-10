const {
  getSingleUser,
  getallUsers,
  updateUser,
  createUser,
  deleteUser,
  loginUser,
  getProfile,
  logoutUser,editProfile
} = require("../controllers/user.controller.js");


const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware.js");
const router = express.Router();

router.get("/feed", getallUsers);
router.get("/profile/view", authMiddleware, getProfile);
router.get("/getSingleUser/:emailId", getSingleUser);

router.post("/createUser", createUser);
router.post("/login", loginUser);
router.post("/logout",logoutUser);

router.put("/updateUser/:id", updateUser);

router.patch("/profile/edit",authMiddleware, editProfile);

router.delete("/deleteUser/:emailId", deleteUser);


module.exports = router;