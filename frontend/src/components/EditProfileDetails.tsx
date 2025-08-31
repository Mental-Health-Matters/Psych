// EditProfileDetails.tsx
import React, { useEffect, useState, useRef } from "react";
import { User, Edit, Save, X, Camera } from "lucide-react";
import Cookies from "js-cookie";
import {jwtDecode} from "jwt-decode";
import axios from "axios";

interface EditProfileDetailsProps {
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onProfileUpdated?: (newUrl?: string) => void;
}

interface Question {
  id: number;
  question: string;
  answer: string;
  isEditing?: boolean;
}

interface Profile {
  email?: string;
  username?: string;
  profilePicture?: string; // this can be a URL or a data:image/... base64 string
}

interface DecodedToken {
  _id?: string;
  [key: string]: any;
}

export default function EditProfileDetails({
  setIsModalOpen,
  onProfileUpdated,
}: EditProfileDetailsProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [profile, setProfile] = useState<Profile>({});
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Profile>({});
  const [editedAnswer, setEditedAnswer] = useState("");
  const [hasChanges, setHasChanges] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get user token and ID (fallback to localStorage if needed)
  const token = Cookies.get("accessToken") || localStorage.getItem("accessToken") || null;
  const decodedToken = token ? jwtDecode<DecodedToken>(token) : null;
  const userId = decodedToken ? decodedToken["_id"] : null;
  console.log("Decoded token:", decodedToken);


  // Fetch user data (profile + questionnaire)
  useEffect(() => {
    if (!userId) return;

    let cancelled = false;
    const getUserData = async (id: string) => {
      try {
        const response = await axios.get(`https://psych-9vpb.onrender.com/api/users/${userId}`, {
          withCredentials: true,
        });
        if (cancelled) return;

        const userData = response.data?.data?.user;
        const questionnaire = response.data?.data?.questionnaire;

        console.log("User API response:", response.data);
        setProfile({
          email: userData?.email ?? "",
          username: userData?.username ?? "",
          profilePicture: userData?.profilePicture ?? "",
        });

        setEditedProfile({
          email: userData?.email ?? "",
          username: userData?.username ?? "",
          profilePicture: userData?.profilePicture ?? "",
        });

        if (questionnaire?.answers) {
          const questionsData = questionnaire.answers.map((q: any, index: number) => ({
            id: index,
            question: q.question,
            answer: q.selectedAnswer,
          }));
          setQuestions(questionsData);
        } else {
          setQuestions([]);
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
      }
    };

    getUserData(userId);
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const handleEditProfile = () => {
    setIsEditingProfile(true);
    setEditedProfile(profile);
    setHasChanges(true);
  };

  const handleSaveProfile = () => {
    setProfile(editedProfile);
    setIsEditingProfile(false);
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      alert("Please select an image: JPEG, PNG or GIF.");
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5 MB
    if (file.size > maxSize) {
      alert("Please select an image smaller than 5MB.");
      return;
    }

    setSelectedImage(file);

    // preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    setHasChanges(true);
  };

  const handlePhotoEditClick = () => {
    fileInputRef.current?.click();
  };

  const handleEditQuestion = (id: number) => {
    setQuestions((qs) =>
      qs.map((q) => {
        if (q.id === id) {
          setEditedAnswer(q.answer);
          return { ...q, isEditing: true };
        }
        return { ...q, isEditing: false };
      })
    );
    setHasChanges(true);
  };

  const handleSaveQuestion = (id: number) => {
    setQuestions((qs) => qs.map((q) => (q.id === id ? { ...q, answer: editedAnswer, isEditing: false } : q)));
  };

  const handleCancelEdit = (id: number) => {
    setQuestions((qs) => qs.map((q) => (q.id === id ? { ...q, isEditing: false } : q)));
  };

  const convertImageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleApplyChanges = async () => {
    if (!userId) {
      alert("User not found or not logged in.");
      return;
    }

    setLoading(true);
    try {
      const sendQuestions = questions.map((q) => ({
        question: q.question,
        selectedAnswer: q.answer,
      }));

      let updatedProfile: Profile = { ...profile };

      // If a new image was selected, convert to base64 and attach
      if (selectedImage) {
        try {
          const base64Image = await convertImageToBase64(selectedImage);
          updatedProfile = { ...updatedProfile, profilePicture: base64Image };
        } catch (err) {
          console.error("Error converting image to base64", err);
          alert("Failed to process image. Try again.");
          setLoading(false);
          return;
        }
      }

      // PATCH to server (server should upload to Cloudinary and return updated user)
      const response = await axios.patch(
        `https://psych-9vpb.onrender.com/api/users/${userId}`,
        { profile: updatedProfile, questionnaire: sendQuestions },
        { headers: { "Content-Type": "application/json" }, withCredentials: true }
      );

      if (response.status === 200 || response.status === 201) {
        const updatedUser = response.data?.data?.user;

        // Use server-returned profilePicture URL (authoritative)
        const returnedProfilePicture = updatedUser?.profilePicture ?? null;

        // Inform parent (Navbar) immediately and cache-bust to force reload
        if (onProfileUpdated) {
          if (returnedProfilePicture) {
            onProfileUpdated(`${returnedProfilePicture}?t=${Date.now()}`);
          } else {
            onProfileUpdated(); // let parent refetch if needed
          }
        }

        // Update local state using server response to keep in-sync
        setProfile({
          email: updatedUser?.email ?? updatedProfile.email,
          username: updatedUser?.username ?? updatedProfile.username,
          profilePicture: updatedUser?.profilePicture ?? updatedProfile.profilePicture,
        });

        // Reset UI
        setHasChanges(false);
        setSelectedImage(null);
        setPreviewUrl("");
        setIsEditingProfile(false);
        setIsModalOpen(false);

        // Also set localStorage if you want cross-tab updates
        try {
          localStorage.setItem("profileUpdatedAt", Date.now().toString());
        } catch (e) {
          /* ignore storage errors */
        }

        alert("Changes applied successfully!");
      } else {
        console.error("Unexpected response:", response);
        alert("Update failed. Try again.");
      }
    } catch (err: any) {
      console.error("Error applying changes:", err);
      const msg = err?.response?.data?.message ?? err?.message ?? "Update failed";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen h-screen max-h-screen bg-gradient-to-b from-blue-50 to-white">
      <header className="bg-gradient-to-r from-blue-700 to-blue-600 text-white p-6 shadow-lg sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold">User Profile</h1>
          <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-blue-600 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6 pb-12">
          {/* Profile Section */}
          <section className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-blue-800">Profile Information</h2>
              {!isEditingProfile && (
                <button onClick={handleEditProfile} className="flex items-center text-blue-600 hover:text-blue-800">
                  <Edit size={18} className="mr-2" />
                  Edit Profile
                </button>
              )}
            </div>

            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex flex-col items-center space-y-4">
                <div className="relative group">
                  <img
                    src={previewUrl || profile.profilePicture}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover border-4 border-blue-200 transition-transform hover:scale-105"
                  />
                  <button
                    onClick={handlePhotoEditClick}
                    className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
                    title="Change profile picture"
                  >
                    <Camera size={16} />
                  </button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif"
                  onChange={handleImageSelect}
                  className="hidden"
                />
                {selectedImage && <p className="text-xs text-blue-600 text-center">New photo selected: {selectedImage.name}</p>}
              </div>

              <div className="flex-grow space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-blue-600">Username</label>
                  {isEditingProfile ? (
                    <input
                      type="text"
                      value={editedProfile.username || ""}
                      onChange={(e) => setEditedProfile({ ...editedProfile, username: e.target.value })}
                      className="w-full p-2 border border-blue-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <div className="flex items-center">
                      <User size={18} className="text-blue-400 mr-2" />
                      <span className="text-gray-800">{profile.username}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-blue-600">Email</label>
                  <div className="text-gray-800">{profile.email}</div>
                </div>

                {isEditingProfile && (
                  <div className="flex justify-end space-x-4">
                    <button onClick={() => setIsEditingProfile(false)} className="px-4 py-2 text-blue-700 border border-blue-700 rounded-md hover:bg-blue-50">
                      Cancel
                    </button>
                    <button onClick={handleSaveProfile} className="px-4 py-2 bg-blue-700 text-white rounded-md hover:bg-blue-800">
                      Save Profile
                    </button>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Questionnaire Section */}
          <section className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-blue-800 mb-6">Questionnaire Responses</h2>
            <div className="space-y-6">
              {questions.map((q) => (
                <div key={q.id} className="bg-blue-50 p-6 rounded-xl transition-all hover:shadow-md">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium text-blue-700 text-lg">{q.question}</h3>
                    {!q.isEditing && (
                      <button onClick={() => handleEditQuestion(q.id)} className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-100">
                        <Edit size={18} />
                      </button>
                    )}
                  </div>

                  {q.isEditing ? (
                    <div className="mt-4">
                      <textarea
                        value={editedAnswer}
                        onChange={(e) => setEditedAnswer(e.target.value)}
                        className="w-full p-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                      />
                      <div className="flex justify-end mt-4 space-x-3">
                        <button onClick={() => handleCancelEdit(q.id)} className="px-4 py-2 text-blue-700 border border-blue-700 rounded-md hover:bg-blue-50">
                          Cancel
                        </button>
                        <button onClick={() => handleSaveQuestion(q.id)} className="px-4 py-2 bg-blue-700 text-white rounded-md hover:bg-blue-800">
                          Save Answer
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-3 text-gray-700">{q.answer}</p>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Apply Changes Button */}
          <div className="flex justify-end pb-8">
            <button
              onClick={handleApplyChanges}
              disabled={!hasChanges || loading}
              className={`flex items-center px-6 py-3 rounded-lg transition-all ${
                hasChanges && !loading ? "bg-blue-700 text-white hover:bg-blue-800 shadow-lg hover:shadow-xl" : "bg-blue-300 text-white cursor-not-allowed"
              }`}
            >
              <Save size={20} className="mr-2" />
              {loading ? "Saving..." : "Apply All Changes"}
            </button>
          </div>
        </div>
      </main>

      <footer className="bg-gradient-to-r from-blue-700 to-blue-600 text-white p-4 text-center">
        <p className="text-sm">© 2025 Profile Manager</p>
      </footer>
    </div>
  );
}
