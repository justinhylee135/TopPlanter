// netlify/functions/search-plant.js
const axios = require("axios");
// const TREFLE_TOKEN = process.env.TREFLE_API_KEY;

// Access the TREFLE_TOKEN environment variable
console.log("TREFLE_TOKEN from env:", process.env.TREFLE_API_KEY);

exports.handler = async function (event, context) {
  if (event.httpMethod !== "GET") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const plantName = event.queryStringParameters.q;

  if (!plantName) {
    return { statusCode: 400, body: "Plant name is required" };
  }

  try {
    const searchResponse = await axios.get(
      `https://trefle.io/api/v1/plants/search`,
      {
        params: {
          token: TREFLE_TOKEN, // Use the environment variable here
          q: plantName, // Corrected from 'q' to 'plantName'
        },
      }
    );

    let calculatedCarbonSaved = 0;

    if (!searchResponse.data || !searchResponse.data.data[0]) {
      calculatedCarbonSaved = 10;
    } else {
      calculatedCarbonSaved = 22;
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ carbonSaved: calculatedCarbonSaved }),
    };
  } catch (error) {
    console.error("Error fetching plant data:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch plant data" }),
    };
  }
};
