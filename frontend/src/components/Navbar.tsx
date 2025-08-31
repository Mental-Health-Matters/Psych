import React, { useEffect, useState } from 'react';
import EditProfileDetails from './EditProfileDetails';
import axios from 'axios';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

interface NavbarProps {
  setIsSection: React.Dispatch<React.SetStateAction<'MainWindow' | 'Blogs' | 'Find_therapist'>>;
  profileImageUrl?: string;
}

export default function Navbar({ setIsSection, profileImageUrl }: NavbarProps) {
  const token = Cookies.get("accessToken");
  const decodedToken = token ? jwtDecode(token) : null;
  const userId = decodedToken ? decodedToken["_id"] : null;

  const defaultAvatar = 'https://i.pravatar.cc/300?img=8';
  const [imageUrl, setImageUrl] = useState(defaultAvatar)


  useEffect(() => {
    const fetchImage = async () => {
      if (!userId) return;
      try {
        const res = await axios.get(`https://psych-9vpb.onrender.com/api/users/${userId}`, { withCredentials: true });
        const image = res.data?.data?.user?.profilePicture;
        if (image) setImageUrl(`${image}?t=${Date.now()}`);
      } catch (err) {
        console.error('Failed to fetch user image:', err);
      }
    };
    fetchImage();
  }, [userId]);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleProfileUpdated = (newImageUrl?: string) => {
    if (newImageUrl) {
      setImageUrl(`${newImageUrl}?t=${Date.now()}`); // cache-bust
    } else {
      // if server didn't return url, force refetch (optional)
      if (userId) {
        axios.get(`https://psych-9vpb.onrender.com/api/users/${userId}`, { withCredentials: true })
          .then(res => {
            const image = res.data?.data?.user?.profilePicture;
            if (image) setImageUrl(`${image}?t=${Date.now()}`);
          }).catch(console.error);
      }
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault();
    setIsSection('Blogs');
  };

  const handleMain = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault();
    setIsSection('MainWindow');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <span
              className="text-2xl font-bold text-[#4A90E2] cursor-pointer"
              onClick={handleMain}
            >
              Psych
            </span>
            <div className="hidden md:flex items-center space-x-8 ml-10">
              <a href="#" className="text-gray-700 hover:text-[#4A90E2]">
                Services
              </a>
              <a
                href="#blogs"
                className="text-gray-700 hover:text-[#4A90E2]"
                onClick={handleClick}
              >
                Blogs
              </a>
              <a href="#" className="text-gray-700 hover:text-[#4A90E2]">
                About
              </a>
            </div>
          </div>

          <div className="flex items-center">
            {/* Profile picture circle with blue border */}
            <img
              src={imageUrl}
              alt="User Profile"
              className="w-10 h-10 rounded-full border-2 border-blue-500 object-cover cursor-pointer"
              onClick={() => setIsModalOpen(true)}  // Open modal on profile picture click
            />
          </div>
        </div>
      </div>

      {isModalOpen && (
        <EditProfileDetails
          setIsModalOpen={setIsModalOpen}
          onProfileUpdated={handleProfileUpdated} // << pass callback
        />
      )}
    </nav>
  );
}