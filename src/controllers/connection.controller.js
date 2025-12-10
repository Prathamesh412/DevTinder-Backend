
const ConnectionRequest = require("../models/connectionRequest.model");
const User = require("../models/User.model");

const interestedRequest = async (req, res) => {
  try {
    const userFromId = req.user._id;
    const userToId = req.params.toUserId;
    const status = req.params.status;


    //Check for the status allowed type here
    const allowedStatus = ["ignored", "interested"];

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({
        message: "Invalid status type." + status,
      });
    }

    //Check if the user with userid exists
    const toUser = await User.findById(userToId);
      if (!toUser) {
        return res.status(404).json({ message: "User not found!" });
      }

    //Check if the request exists
    const existingRequest = await ConnectionRequest.findOne({
      $or: [
        { fromUserId: userFromId, toUserId: userToId },
        { fromUserId: userToId, toUserId: userFromId },
      ],
    });
    if (existingRequest) {
      return res.status(400).json({
        message: "Connection request already exists",
        connectionRequest: existingRequest,
      });
    }

    // Check if the user is trying to send a request to themselves
    // if (userFromId.toString() === userToId) {
    //   return res.status(400).json({
    //     message: "You cannot send a connection request to yourself",
    //   });
    // }


    // Add connection request to the database
    const connectionRequest = new ConnectionRequest({
      fromUserId: userFromId,
      toUserId: userToId,
      status: status,
    })

    const newRequest = await connectionRequest.save()
      .then(() => {
        res.status(200).json({
          message: req.user.firstName + " is " + status + " in " + toUser.firstName,
          connectionRequest,
        });
      })
      .catch((error) => {
        res.status(400).json({
          message: "Error sending connection request",
          error: error.message,
        });
      });

  } catch (error) {
    res.status(400).json({ message: "Internal server error" , error: error.message });
  }
}

const reviewRequest = async (req, res) => {
  try {
    const toUserId = req.user._id;
    const requestId = req.params.requestId;
    const status = req.params.status;

    allowedStatus = ["accepted", "rejected"];

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({
        message: "Invalid status type." + status,
      });
    }

    // const existingUser = await User.findById(fromUserId);
    // if (!existingUser) {
    //   return res.status(404).json({ message: "User not found!" });
    // }

    const connectionRequest = await ConnectionRequest.findOne({
      _id: requestId,
      toUserId: toUserId,
      status: "interested",
    });

    if (!connectionRequest) {
      return res
        .status(404)
        .json({ message: "Connection request not found" });
    }

    connectionRequest.status = status;

    const data = await connectionRequest.save();

    res.json({ message: "Connection request " + status, data });
    
  } catch (error) {
    res.status(400).json({ message: "Internal server error" , error: error.message });
  }
}

module.exports = {
  interestedRequest, reviewRequest
};