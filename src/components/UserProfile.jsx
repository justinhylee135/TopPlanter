import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { getStorage, ref, deleteObject } from "firebase/storage";
import { db } from "../firebase.jsx"; // Ensure this path is correct
import { useAuth } from "../AuthContext.jsx"; // Import the AuthContext to get the current user

function UserProfile() {
  const { currentUser } = useAuth();
  const [userPlants, setUserPlants] = useState([]);
  const [totalPlants, setTotalPlants] = useState(0);

  useEffect(() => {
    fetchPlants();
  }, []);

  const fetchPlants = async () => {
    try {
      console.log("Current User:", currentUser); // Log the current user

      const plantCollection = collection(db, "posts");
      const plantSnapshot = await getDocs(plantCollection);

      const plantList = plantSnapshot.docs
        .filter((doc) => doc.data().userId === currentUser.uid)
        .map((doc) => {
          const plantData = {
            id: doc.id,
            ...doc.data(),
          };

          // Calculate the number of days the plant has been alive
          const currentDate = new Date();
          const timestamp = new Date(plantData.timestamp.toDate());
          const timeDifference = currentDate - timestamp;
          const dayDifference = timeDifference / (1000 * 3600 * 24);
          plantData.daysAlive = Math.floor(dayDifference) + 1;

          return plantData;
        });

      console.log("Fetched Plants:", plantList); // Log the fetched plants

      setUserPlants(plantList);
      setTotalPlants(plantList.length); // Set the total number of plants

      // Update the user's plants count in Firestore
      const userRef = doc(db, "users", currentUser.uid);
      await updateDoc(userRef, {
        plants: plantList.length,
      });
    } catch (error) {
      console.error("Error fetching plants:", error);
    }
  };

  const handleDelete = async (plantId) => {
    try {
      // Get the reference to the document in Firestore
      const plantRef = doc(db, "posts", plantId);

      // Get the document data to access the image URL
      const plantDoc = await getDoc(plantRef);
      const plantData = plantDoc.data();

      // Delete the image file from Firebase Cloud Storage
      const storage = getStorage();
      const imageRef = ref(storage, plantData.imageUrl);
      await deleteObject(imageRef);

      // Delete the document from Firestore
      await deleteDoc(plantRef);

      // Refresh the plants list after a successful delete
      fetchPlants();
    } catch (error) {
      console.error("Error deleting plant: ", error);
    }
  };

  return (
    <div className="user-profile">
      <h2>Your Plants</h2>
      <h3>Total Plants: {totalPlants || "None"}</h3>
      <ul>
        {userPlants.map((plant) => (
          <li key={plant.id}>
            <img src={plant.imageUrl} alt="Plant" width="100" />
            <p>Plant Name: {plant.plantName} </p>
            <p>Location: {plant.location}</p>
            <p>
              Date Planted:{" "}
              {plant.timestamp
                ? new Date(plant.timestamp.toDate()).toLocaleDateString()
                : "N/A"}
            </p>
            <p>Days Alive: {plant.daysAlive}</p>
            <p>Annual Absorption Rate: {plant.carbonSaved} kg CO2 </p>
            <p>
              CO2 Absorbed: {" "}
              {plant.daysAlive && plant.daysAlive > 0
                ? ((plant.carbonSaved / 365) * plant.daysAlive).toFixed(2)
                : "N/A"}{" "}
              kg
            </p>
            <button onClick={() => handleDelete(plant.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default UserProfile;
