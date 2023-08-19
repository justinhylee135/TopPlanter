// netlify/functions/search-plant.js
const axios = require('axios');

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const plantName = event.queryStringParameters.q;

  if (!plantName) {
    return { statusCode: 400, body: 'Plant name is required' };
  }

  try {
    const searchResponse = await axios.get(
      `http://localhost:3000/plants/search`,
      {
        params: { q: plantName },
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
      body: JSON.stringify({ error: 'Failed to fetch plant data' }),
    };
  }
};
