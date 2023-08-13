import React from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { signInWithGoogle } from '../firebase';
import { useAuth } from '../AuthContext.jsx';

function Login() {
  const { currentUser, setCurrentUser } = useAuth();
  const navigate = useNavigate(); // Get the navigate function

  const handleGoogleSignIn = async () => {
    const user = await signInWithGoogle();
    if (user) {
      console.log("Successfully signed in as:", user.displayName);
      setCurrentUser(user);
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
