const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const issueRoutes = require("./routes/issueRoutes");

const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

connectDB();

app.use("/api", issueRoutes);

app.listen(5000, () => console.log("🚀 Backend running on port 5000"));
