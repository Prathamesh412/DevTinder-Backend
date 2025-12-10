const ConnectionRequest = require("../models/connectionRequest.model.js");
const User = require("../models/User.model.js");
const USER_SAFE_DATA = "_id firstName lastName photoUrl age gender about skills";

// const getConnections = async (req, res) => {
//   try {
//     const loggedInUser = req.user;

//     const requestedConnections = await ConnectionRequest.find({
//       $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
//       status: "accepted",
//     })
//       .populate("fromUserId", ["firstName", "lastName"])
//       .populate("toUserId", ["firstName", "lastName"]);

//     const data = connectionRequests.map((row) => {
//       if (row.fromUserId._id.toString() === loggedInUser._id.toString()) {
//         return row.toUserId;
//       }
//       return row.fromUserId;
//     });

//     res.status(200).json({
//       message: "User connections",
//       data: data,
//     });
//   } catch (error) {
//     res
//       .status(400)
//       .json({ message: "Internal server error", error: error.message });
//   }
// };

// Utility function to fetch connections
async function fetchConnections(loggedInUser) {
  const requestedConnections = await ConnectionRequest.find({
    $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
    status: "accepted",
  })
    .populate("fromUserId", ["firstName", "lastName", "photoUrl"])
    .populate("toUserId", ["firstName", "lastName", "photoUrl"]);

  // Get the other user in each connection
  return requestedConnections.map((row) => {
    if (row.fromUserId._id.toString() === loggedInUser._id.toString()) {
      return row.toUserId;
    }
    return row.fromUserId;
  });
}

const getConnections = async (req, res) => {
  try {
    const connections = await fetchConnections(req.user);

    // API response
    if (req.xhr || req.headers.accept.indexOf('json') > -1) {
      return res.json({ connections });
    }

    // SSR fallback (optional)
    res.render("connections", { connections });
  } catch (error) {
    if (req.xhr || req.headers.accept.indexOf('json') > -1) {
      return res.status(400).json({ message: "Internal server error", error: error.message });
    }
    res.status(500).render("connections", { connections: [], error: error.message });
  }
};

// const getRequests = async (req, res) => {
//   try {
//     const loggedInUser = req.user;
//     console.log("Logged in user: ", loggedInUser);

//     const userRequests = await ConnectionRequest.find({
//       toUserId: loggedInUser._id,
//       status: "accepted",
//     }).populate("fromUserId", ["firstName", "lastName"]);

//     res.status(200).json({
//       message: "User requests",
//       data: userRequests,
//     });
//   } catch (error) {
//     res
//       .status(400)
//       .json({ message: "Internal server error", error: error.message });
//   }
// };

async function fetchRequests(loggedInUser) {
  const ConnectionRequest = require("../models/connectionRequest.model.js");
  // Find all pending requests sent TO the logged-in user
  const requests = await ConnectionRequest.find({
    toUserId: loggedInUser._id,
    status: "pending",
  })
    .populate("fromUserId", ["firstName", "lastName", "photoUrl", "about"]);

  // Return the requesting users
  return requests.map(row => row.fromUserId);
}

const getRequests = async (req, res) => {
  try {
    const requests = await fetchRequests(req.user);

    // API response
    if (req.xhr || req.headers.accept.indexOf('json') > -1) {
      return res.json({ requests });
    }

    // SSR fallback (optional)
    res.render("requests", { requests });
  } catch (error) {
    if (req.xhr || req.headers.accept.indexOf('json') > -1) {
      return res.status(400).json({ message: "Internal server error", error: error.message });
    }
    res.status(500).render("requests", { requests: [], error: error.message });
  }
};


const getFeed = async (req, res) => {
  try {
    const loggedInUser = req.user;
    
    if (!loggedInUser) {
      return res.status(401).json({ message: "Unauthorized. Please login." });
    }
    
    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    limit = limit > 50 ? 50 : limit;
    const skip = (page - 1) * limit;

    const connectionRequests = await ConnectionRequest.find({
      $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
    }).select("fromUserId toUserId");

    const hideUsersFromFeed = new Set();
    connectionRequests.forEach((req) => {
      hideUsersFromFeed.add(req.fromUserId.toString());
      hideUsersFromFeed.add(req.toUserId.toString());
    });

    const users = await User.find({
      $and: [
        { _id: { $nin: Array.from(hideUsersFromFeed) } },
        { _id: { $ne: loggedInUser._id } },
      ],
    })
      .select(USER_SAFE_DATA)
      .skip(skip)
      .limit(limit);

    // Always return JSON for API routes (check if it's an API request)
    const isApiRequest = req.xhr || 
                        (req.headers.accept && req.headers.accept.indexOf('json') > -1) ||
                        req.path.startsWith('/getUser') ||
                        req.path.startsWith('/api');
    
    if (isApiRequest) {
      console.log(`Feed API: Returning ${users.length} users for user ${loggedInUser._id}`);
      return res.json({ users });
    }

    // Otherwise, render EJS view
    res.render("feed", { users });
  } catch (error) {
    console.error("Error in getFeed:", error);
    
    const isApiRequest = req.xhr || 
                        (req.headers.accept && req.headers.accept.indexOf('json') > -1) ||
                        req.path.startsWith('/getUser') ||
                        req.path.startsWith('/api');
    
    if (isApiRequest) {
      return res.status(500).json({ 
        message: "Internal server error", 
        error: error.message,
        users: [] 
      });
    }
    res.status(500).render("feed", { users: [], error: error.message });
  }
};

module.exports = {
  getConnections,
  getRequests,
  getFeed,
  fetchConnections,
  fetchRequests};
