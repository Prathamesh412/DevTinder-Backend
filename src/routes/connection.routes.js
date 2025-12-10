const {interestedRequest, reviewRequest} = require('../controllers/connection.controller.js');
const authMiddleware = require("../middlewares/auth.middleware.js");
const router = require("express").Router();


router.post("/send/:status/:toUserId", authMiddleware, interestedRequest)
router.post("/review/:status/:requestId", authMiddleware, reviewRequest)

module.exports = router;