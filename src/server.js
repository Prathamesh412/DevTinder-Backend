
require("dotenv").config();
PORT = process.env.PORT || 7777;
const express = require("express");
const connectDB = require("./config/database.config.js");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require("path");
const app = express();
const authMiddleware = require("./middlewares/auth.middleware.js");
const UserModel = require("./models/User.model.js");
const jwt = require("jsonwebtoken");

const { fetchConnections } = require("./controllers/getUserData.controller.js");
const { fetchRequests } = require("./controllers/getUserData.controller.js");

// CORS configuration
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Set EJS as templating engine
app.set('view engine', 'ejs');
app.set("views", path.join(__dirname, "views"));

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname,'../public')));

// Middleware to check authentication
app.use(async (req, res, next) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await UserModel.findById(decoded.id);
      res.locals.user = user;
    } else {
      res.locals.user = null;
    }
  } catch (err) {
    res.locals.user = null;
  }
  next();
});

// Routes for rendering views

// app.get("/", (req, res) => {
//     res.redirect("/getUser/feed")
// });

// app.get("/home", (req, res) => {
//     res.render("home");
// });

// app.get("/login", (req, res) => {
//     res.render("login");
// });

// app.get("/signup", (req, res) => {
//     res.render("signup");
// });


// app.get("/profile", authMiddleware, (req, res) => {
//     res.render("profile");
// });

// app.get("/connections", authMiddleware, async (req, res) => {
//   try {
//     const connections = await fetchConnections(req.user);
//     res.render("connections", { connections });
//   } catch (error) {
//     res.render("connections", { connections: [], error: error.message });
//   }
// });

// app.get("/requests", authMiddleware, async (req, res) => {
//   try {
//     const requests = await fetchRequests(req.user);
//     res.render("requests", { requests });
//   } catch (error) {
//     res.render("requests", { requests: [], error: error.message });
//   }
// });

app.use("/user", require("./routes/user.routes.js"));
app.use("/request", require("./routes/connection.routes.js"));
app.use("/getUser", require("./routes/getUserData.routes.js"));

connectDB().then(() => {
    console.log("Connected to MongoDB");
    app.listen(process.env.PORT, () => {
        console.log("Server is successfully listening on port", PORT);
    });
}
).catch((err) => {
    console.error("Error connecting to MongoDB", err);
});


