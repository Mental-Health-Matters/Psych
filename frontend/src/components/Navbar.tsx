import React, { useState } from 'react';
import EditProfileDetails from './EditProfileDetails';

interface NavbarProps {
  setIsSection: React.Dispatch<React.SetStateAction<'MainWindow' | 'Blogs' | 'Find_therapist'>>;
  profileImageUrl?: string;  // URL of the user's profile picture
}

export default function Navbar({ setIsSection, profileImageUrl }: NavbarProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Default avatar if none provided
  const defaultAvatar = 'https://i.pravatar.cc/300?img=8';
  const avatarSrc = profileImageUrl || defaultAvatar;

  // Dummy user data for profile details
  const userData = {
    username: 'john_doe', // Example username
    email: 'john@example.com', // Example email
    profilePictureUrl: profileImageUrl || defaultAvatar, // Profile picture URL
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
              src={avatarSrc}
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
        />
      )}
    </nav>
  );
}