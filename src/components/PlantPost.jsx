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
  const [carbonSaved, setCarbonSaved] = useState(0);
  const [loading, setLoading] = useState(false);
  const [plantName, setPlantName] = useState("");
  const [identifiedPlantName, setIdentifiedPlantName] = useState(null);
  const { currentUser } = useAuth();
  const storage = getStorage();
  const API_KEY = "Ev73HGdUwTzNoOGreVac0lhSfEj876JB0NqEEZqjDtqwPQinvI";

  const identifyWithAI = async () => {
    if (image) {
      setLoading(true);

      // Create a FormData object
      const formData = new FormData();
      formData.append("images", image);
      formData.append("latitude", "49.207");
      formData.append("longitude", "16.608");
      formData.append("similar_images", "true");

      try {
        // Send the image to the Plant.id API for identification
        const response = await axios.post(
          "https://plant.id/api/v3/identification",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              "Api-Key": API_KEY,
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
        setIdentifiedPlantName("No plant has been identified or an error has occured");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSubmit = async () => {
    if (image) {
      setLoading(true);

      // Upload the image to Firebase Storage
      const storageRef = ref(storage, 'uploads/' + image.name);
      const uploadTask = uploadBytesResumable(storageRef, image);

      // Get the download URL of the image and save the data to Firestore
      uploadTask.on('state_changed', 
        () => {},
        (error) => {
          console.error("Error uploading image: ", error);
        }, 
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          await addDoc(collection(db, 'posts'), {
            userId: currentUser.uid,
            plantName: plantName || "Not Identified", // Use the user-entered plant name
            imageUrl: downloadURL,
            location: location,
            carbonSaved: carbonSaved,
            timestamp: new Date(),
          });
        }
      );

      setLoading(false);
    }
  };

  const copyPlantNameToInput = () => {
    setPlantName(identifiedPlantName);
  };

  return (
    <div>
      <input type="file" onChange={(e) => setImage(e.target.files[0])} />
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
      <button onClick={handleSubmit} disabled={loading}>
        Post
      </button>
      <p>Estimated Carbon Saved: {carbonSaved}kg CO2 annually</p>
      {identifiedPlantName && (
        <>
          <p>AI Identified Plant: {identifiedPlantName}</p>
          <button onClick={copyPlantNameToInput}>
            Copy Name to Input
          </button>
        </>
      )}
    </div>
  );
}

export default PlantPost;
