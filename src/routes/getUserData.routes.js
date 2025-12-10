const Router = require("express").Router();
const{getConnections, getFeed, getRequests} = require("../controllers/getUserData.controller.js");
const authMiddleware = require("../middlewares/auth.middleware.js");

Router.get("/connections",authMiddleware, getConnections)
Router.get("/feed", authMiddleware, getFeed)
Router.get("/requests", authMiddleware, getRequests)

module.exports = Router;