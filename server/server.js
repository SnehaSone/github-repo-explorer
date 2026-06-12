const express = require("express");
const cache = {};
const cors = require("cors");
const axios = require("axios");

const app = express();

app.use(cors());

app.get("/", (req, res) => {
  res.send("GitHub Repo Explorer Backend Running");
});

app.get("/api/github/:username", async (req, res) => {
  try {
    const username = req.params.username;
    if (
    cache[username] &&
    Date.now() - cache[username].timestamp < 60000
    ) {
    console.log("Serving from cache");    
    return res.json(cache[username].data);
    }

    const userResponse = await axios.get(
      `https://api.github.com/users/${username}`
    );

    const repoResponse = await axios.get(
      `https://api.github.com/users/${username}/repos`
    );

    const result = {
    user: userResponse.data,
    repos: repoResponse.data,
    };

    cache[username] = {
    data: result,
    timestamp: Date.now(),
    };
    console.log("Fetching from GitHub API");
    res.json(result);

  } catch (error) {
    res.status(404).json({
      message: "User not found",
    });
  }
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});