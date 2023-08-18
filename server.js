import express from "express";
import axios from "axios";
import cors from "cors";
import "dotenv/config";

// Import Babel Register
import "@babel/register";

const TREFLE_API_KEY = process.env.TREFLE_API_KEY;
console.log("Trefle API Key:", TREFLE_API_KEY);

const app = express();
const PORT = 3000;

app.use(cors()); // Enable CORS for all routes

// Middleware to rewrite .jsx requests to .js
app.use((req, res, next) => {
  if (req.path.endsWith(".jsx")) {
    req.url = req.url.replace(".jsx", ".js");
  }
  next();
});

// Serve the transpiled .jsx files from the 'src' directory
app.use(express.static("src"));

app.get("/plants/search", async (req, res) => {
  try {
    const response = await axios.get("https://trefle.io/api/v1/plants/search", {
      params: {
        token: TREFLE_API_KEY,
        q: req.query.q,
      },
    });
    res.send(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching data from Trefle API");
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
