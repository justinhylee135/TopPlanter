import React, { useState } from 'react';
import { useAuth } from '../AuthContext.jsx';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { collection, addDoc } from "firebase/firestore"; 
import { db } from '../firebase.jsx';

function PlantPost() {
  const [image, setImage] = useState(null);
  const [location, setLocation] = useState('');
  const [carbonSaved, setCarbonSaved] = useState(0);
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth(); // Get the current user from the AuthContext

  const storage = getStorage();

  const handleSubmit = async () => {
    if (image) {
      setLoading(true);

      // Logic to calculate carbonSaved based on plant type and other factors
      setCarbonSaved(10);

      // Upload image to Firebase storage
      const storageRef = ref(storage, `uploads/${image.name}`);
      const uploadTask = uploadBytesResumable(storageRef, image);

      uploadTask.on('state_changed', 
        (snapshot) => {
          // You can use this to show upload progress
        }, 
        (error) => {
          console.error("Error uploading image: ", error);
          setLoading(false);
        }, 
        async () => {
          try {
            // Get the download URL of the uploaded image
            const downloadURL = await getDownloadURL(storageRef);

            // Store post data in Firestore
            const docRef = await addDoc(collection(db, 'posts'), {
              location,
              carbonSaved,
              imageUrl: downloadURL,
              userId: currentUser.uid, // Store the user's UID with the post
              // Add other fields if needed
            });

            console.log("Document written with ID: ", docRef.id);
          } catch (error) {
            console.error("Error saving to Firestore: ", error);
          } finally {
            setLoading(false);
          }
        }
      );
    }
  }

  return (
    <div>
      <input type="file" onChange={(e) => setImage(e.target.files[0])} />
      <input type="text" placeholder="Location" onChange={(e) => setLocation(e.target.value)} />
      <button onClick={handleSubmit} disabled={loading}>Post</button>
      <p>Estimated Carbon Saved: {carbonSaved}kg CO2 annually</p>
    </div>
  );
}

export default PlantPost;
