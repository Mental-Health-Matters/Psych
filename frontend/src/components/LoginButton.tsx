import axios from 'axios';
import { useState } from 'react';
import React from 'react';


const LoginButton = () => {
  const [loading, setLoading] = useState(false);

  return (
    <div className="mt-4">
      {loading && <p className="text-sm text-gray-500 mt-2">Logging in...</p>}
    </div>
  );
};

export default LoginButton;
