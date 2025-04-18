import React, { useState } from 'react';
import { X } from 'lucide-react'; // Import the X icon for closing the modal

interface NavbarProps {
  setIsSection: React.Dispatch<React.SetStateAction<'MainWindow' | 'Blogs' | 'Find_therapist'>>;
  profileImageUrl?: string;  // URL of the user's profile picture
}

const EditProfileDetails = ({ setModalOpen, userData, updateProfile }: any) => {
  const [formData, setFormData] = useState({
    profilePictureUrl: userData.profilePictureUrl || '', // Set the initial profile picture URL
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(formData);  // Call updateProfile function to update profile details
    setModalOpen(false);  // Close the modal after submission
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-xl max-w-sm w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Edit Profile</h3>
          <button
            className="p-2 rounded-full hover:bg-gray-100"
            onClick={() => setModalOpen(false)}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Username</label>
            <input
              type="text"
              value={userData.username}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
              disabled
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={userData.email}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
              disabled
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Profile Picture URL</label>
            <input
              type="text"
              name="profilePictureUrl"
              value={formData.profilePictureUrl}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

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

  const updateProfile = (formData: any) => {
    // Update profile logic goes here (e.g., send a request to the backend)
    console.log('Updated Profile Data:', formData);
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
          setModalOpen={setIsModalOpen}
          userData={userData}
          updateProfile={updateProfile}
        />
      )}
    </nav>
  );
}
