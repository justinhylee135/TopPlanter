import React from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithGoogle } from '../firebase';
import { useAuth } from '../AuthContext.jsx';
import { getFirestore, doc, setDoc, getDoc, updateDoc } from "firebase/firestore";

function Login() {
  const { currentUser, setCurrentUser } = useAuth();
  const navigate = useNavigate();
  const db = getFirestore();

  const handleGoogleSignIn = async () => {
    const user = await signInWithGoogle();
    if (user) {
      console.log("Successfully signed in as:", user.displayName);
      setCurrentUser(user);

      // Check if user exists in Firestore
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        // If user doesn't exist, create a new user document
        await setDoc(userRef, {
          uid: user.uid,
          name: user.displayName,
          email: user.email,
          profileImage: user.photoURL,
          plants: 0, // Initial value
        });
      } else {
        // If user exists, you can update any necessary fields here
        // For this example, I'm just leaving it as is
      }

      navigate('/'); // Navigate to the home page

    } else {
      console.log("Failed to sign in with Google");
    }
  };

  if (currentUser) {
    return <p>You are already signed in as {currentUser.displayName}.</p>;
  }

  return (
    <div>
      <button onClick={handleGoogleSignIn}>Sign in with Google</button>
    </div>
  );
}

export default Login;
