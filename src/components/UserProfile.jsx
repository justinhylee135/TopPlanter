import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase.jsx'; // Ensure this path is correct
import { useAuth } from '../AuthContext.jsx'; // Import the AuthContext to get the current user

function UserProfile() {
  const { currentUser } = useAuth();
  const [userPlants, setUserPlants] = useState([]);

  useEffect(() => {
    fetchPlants();
  }, []);

  const fetchPlants = async () => {
    try {
      console.log("Current User:", currentUser); // Log the current user
  
      const plantCollection = collection(db, 'posts');
      const plantSnapshot = await getDocs(plantCollection);
  
      const plantList = plantSnapshot.docs
        .filter(doc => doc.data().userId === currentUser.uid)
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
  
      console.log("Fetched Plants:", plantList); // Log the fetched plants
  
      setUserPlants(plantList);
  
      // Update the user's plants count in Firestore
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        plants: plantList.length
      });
    } catch (error) {
      console.error("Error fetching plants:", error);
    }
  };
  

  const handleDelete = async (plantId) => {
    try {
      const plantRef = doc(db, 'posts', plantId);
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
      <ul>
        {userPlants.map(plant => (
          <li key={plant.id}>
            <img src={plant.imageUrl} alt="Plant" width="100" />
            <p>Location: {plant.location}</p>
            <p>Carbon Saved: {plant.carbonSaved}kg CO2 annually</p>
            <button onClick={() => handleDelete(plant.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default UserProfile;
