const jwt = require("jsonwebtoken");
const UserModel = require("../models/User.model.js");

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
      // If AJAX/API request, send JSON. Otherwise, redirect.
      if (req.xhr || req.headers.accept.indexOf('json') > -1) {
        return res.status(401).json({ message: "Unauthorized. Please login." });
      } else {
        return res.redirect("/login");
      }
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await UserModel.findById(decoded.id);

    if (!user) {
      if (req.xhr || req.headers.accept.indexOf('json') > -1) {
        return res.status(401).json({ message: "Unauthorized. User not found." });
      } else {
        return res.redirect("/login");
      }
    }

    req.user = user;
    next();
  } catch (error) {
    if (req.xhr || req.headers.accept.indexOf('json') > -1) {
      return res.status(401).json({ message: "Unauthorized. Please login again." });
    } else {
      return res.redirect("/login");
    }
  }
};

module.exports = authMiddleware;