import React, { useState } from "react";
import { useAuth } from "../AuthContext.jsx";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase.jsx";
import axios from "axios";

function PlantPost() {
  const [image, setImage] = useState(null);
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [plantName, setPlantName] = useState("");
  const [carbonSaved, setCarbonSaved] = useState(0);
  const [identifiedPlantName, setIdentifiedPlantName] = useState(null);
  const [postSuccess, setPostSuccess] = useState(false);
  const { currentUser } = useAuth();
  const storage = getStorage();
  const PlantId_API_KEY = "Ev73HGdUwTzNoOGreVac0lhSfEj876JB0NqEEZqjDtqwPQinvI";
  const k = 0.5; // constant for carbon absorption calculation


  const TREFLE_TOKEN = "GDxikdaFSC_oTZZv6_TN84XM73TPsDnGRHrgJbljgho";

  const calculateCarbon = async (plantName) => {
    let calculatedCarbonSaved = 0;

    if (plantName) {
      try {
        // Access the TREFLE_TOKEN environment variable
        console.log("TREFLE_TOKEN from env:", process.env.TREFLE_API_KEY);

        // First, search for the plant closest to the given plantName
        const searchResponse = await axios.get(
          "/.netlify/functions/search-plant", // Updated URL
          {
            params: {
              token: TREFLE_TOKEN,
              q: plantName, // Update this line
            },
          }
        );

        console.log("Search API Response:", searchResponse.data);

        calculatedCarbonSaved = searchResponse.data.carbonSaved;
      } catch (error) {
        console.error("Error fetching plant data:", error);
      }
    }

    return calculatedCarbonSaved;
  };

  const identifyWithAI = async () => {
    if (image) {
      setLoading(true);

      // Create a FormData object
      const formData = new FormData();
      formData.append("images", image);
      formData.append("similar_images", "true");

      try {
        // Send the image to the Plant.id API for identification
        const response = await axios.post(
          "https://plant.id/api/v3/identification",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              "Api-Key": PlantId_API_KEY,
            },
          }
        );

        // Log the entire response for debugging
        console.log("API Response:", response);

        // Extract the identified plant name from the API response
        const name = response.data.result.classification.suggestions[0].name;
        setIdentifiedPlantName(name);
        console.log("Extracted Plant Name:", name);
      } catch (error) {
        console.error("Error identifying plant: ", error);
        console.log("Error Response:", error.response && error.response.data);
        setIdentifiedPlantName(
          "No plant has been identified or an error has occured"
        );
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSubmit = async () => {
    if (image) {
      setLoading(true);
      setPostSuccess(false);
      console.log("Starting the upload...");

      // Upload the image to Firebase Storage
      const storageRef = ref(storage, "uploads/" + image.name);
      const uploadTask = uploadBytesResumable(storageRef, image);

      // Call the calculateCarbon function when the user posts a photo
      const calculatedCarbonSaved = await calculateCarbon(
        plantName || identifiedPlantName
      );

      setCarbonSaved(calculatedCarbonSaved);

      // Get the download URL of the image and save the data to Firestore
      uploadTask.on(
        "state_changed",
        () => {},
        (error) => {
          console.error("Error uploading image: ", error);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          await addDoc(collection(db, "posts"), {
            userId: currentUser.uid,
            plantName: plantName || "Not Identified",
            imageUrl: downloadURL,
            location: location || "No Location Provided",
            carbonSaved: calculatedCarbonSaved,
            timestamp: new Date(),
          });

          setPostSuccess(true);
          setLoading(false);
          console.log("Upload successful, postSuccess should be true now.");
        }
      );
    }
  };

  const copyPlantNameToInput = () => {
    setPlantName(identifiedPlantName);
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
    setPostSuccess(false); // Reset the postSuccess state when a new image is selected
  };

  return (
    <div>
      <input type="file" onChange={handleImageChange} />
      <input
        type="text"
        placeholder="Location"
        onChange={(e) => setLocation(e.target.value)}
      />
      <input
        type="text"
        placeholder="Enter Plant Name"
        value={plantName}
        onChange={(e) => setPlantName(e.target.value)}
      />
      <button onClick={identifyWithAI} disabled={loading}>
        Identify With AI
      </button>
      <button onClick={handleSubmit} disabled={loading || postSuccess}>
        {postSuccess ? "Successfully Posted" : "Post and Calculate CO2"}
      </button>
      <p>Estimated Carbon Saved: {carbonSaved}kg CO2 annually</p>
      {identifiedPlantName && (
        <>
          <p>AI Identified Plant: {identifiedPlantName}</p>
          <button onClick={copyPlantNameToInput}>Copy Name to Input</button>
        </>
      )}
    </div>
  );
}

export default PlantPost;
