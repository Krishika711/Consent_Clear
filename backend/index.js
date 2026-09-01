require("dotenv").config();
const express = require("express");
const cors = require("cors");
const analyzeRoute = require("./routes/analyze");
const { startMonitoring } = require("./lib/monitor");

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api", analyzeRoute);

startMonitoring();

app.get("/", (req, res) => res.json({ status: "RedFlag backend running" }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
