import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { useState } from 'react';
import React from 'react';


const LoginButton = () => {
  const [loading, setLoading] = useState(false);

  const handleGoogleLoginSuccess = async (credentialResponse: any) => {
    setLoading(true);
    try {
      const token = credentialResponse.credential;

      const res = await axios.post(
        'http://localhost:5000/api/auth/googlelogin',
        { token },
        { withCredentials: true }
      );

      console.log('Google login successful:', res.data);
      // TODO: update global auth state or redirect
    } catch (error) {
      console.error('Google login failed:', error);
      alert('Google login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4">
      <GoogleLogin
        onSuccess={handleGoogleLoginSuccess}
        onError={() => {
          console.log('Google login failed');
          alert('Google login failed');
        }}
        useOneTap
      />
      {loading && <p className="text-sm text-gray-500 mt-2">Logging in...</p>}
    </div>
  );
};

export default LoginButton;
