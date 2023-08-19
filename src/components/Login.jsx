import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithGoogle } from "../firebase";
import { useAuth } from "../AuthContext.jsx";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";

function Login() {
  const { currentUser, setCurrentUser } = useAuth();
  const navigate = useNavigate();
  const db = getFirestore();
  const auth = getAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSignUp, setIsSignUp] = useState(false); // New state to toggle between Sign In and Sign Up

  const handleGoogleSignIn = async () => {
    const user = await signInWithGoogle();
    if (user) {
      console.log("Successfully signed in as:", user.displayName);
      setCurrentUser(user);

      // Check if user exists in Firestore
      const userRef = doc(db, "users", user.uid);
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

      navigate("/"); // Navigate to the home page
    } else {
      console.log("Failed to sign in with Google");
    }
  };

  const handleEmailSignIn = async (e) => {
    e.preventDefault();

    try {
      setError("");
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      setCurrentUser(user);
      navigate("/"); // Navigate to the home page
    } catch (err) {
      setError("Failed to sign in: " + err.message);
    }
  };

  const handleEmailSignUp = async (e) => {
    e.preventDefault();

    try {
      setError("");
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      setCurrentUser(user);

      // Create a new user document in Firestore
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, {
        uid: user.uid,
        name: user.displayName || "",
        email: user.email,
        profileImage: user.photoURL || "",
        plants: 0, // Initial value
      });

      navigate("/"); // Navigate to the home page
    } catch (err) {
      setError("Failed to sign up: " + err.message);
    }
  };

  if (currentUser) {
    return <p>You are already signed in as {currentUser.displayName}.</p>;
  }

  return (
    <div>
      <form onSubmit={handleEmailSignIn}>
        <div>
          <label>Email: </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password: </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Sign In</button>
      </form>

      <form onSubmit={handleEmailSignUp}>
        <div>
          <label>Email: </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password: </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Sign Up</button>
      </form>

      {error && <p>{error}</p>}
      <button onClick={handleGoogleSignIn}>Sign in with Google</button>
    </div>
  );
}

export default Login;
