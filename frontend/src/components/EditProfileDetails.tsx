import React, { useEffect, useState } from "react";
import { User, Edit, Save, X } from "lucide-react";
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

interface EditProfileDetailsProps {
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

function EditProfileDetails ({ setIsModalOpen } : EditProfileDetailsProps) {

  // Questions for questionnaire section
  interface Question {
    id: number;
    question: string;
    answer: string;
    isEditing?: boolean;
  }
  const [questions, setQuestions] = useState<Question[]>([]);

  // User profile data
  interface Profile {
    email?: string;
    username?: string;
    profilePicture?: string;
  }
  const [profile, setProfile] = useState<Profile>({});

  //Fetch and decoded User Id from JWT token
  const token = Cookies.get("accessToken");
  const decodedToken = token ? jwtDecode(token) : null;
  const userId = decodedToken ? decodedToken["_id"] : null;

  // send userId to backend to get user data
  useEffect(() => {
  async function getUserData(userId: string) {
    
      const response = await axios.get(`http://localhost:3000/api/users/${userId}`)
      const userData = response.data.data.user;
      const questionnaire = response.data.data.questionnaire;

      setProfile({
        email: userData.email,
        username: userData.username,
        profilePicture: userData.profilePicture,
      });

      const questionsData = questionnaire.answers.map((q: any, index: number) => ({
        id: index,
        question: q.question,
        answer: q.selectedAnswer,
      }));

      setQuestions(questionsData);
    }

    getUserData(userId);
  }, [userId]);

  
  // State for edited answer
  const [editedAnswer, setEditedAnswer] = useState("");
  
  // State to track if there are unsaved changes
  const [hasChanges, setHasChanges] = useState(false);

  // Handle starting to edit a question
  const handleEditQuestion = (id: number) => {
    setQuestions(questions.map(q => {
      if (q.id === id) {
        setEditedAnswer(q.answer);
        return { ...q, isEditing: true };
      }
      return { ...q, isEditing: false };
    }));
    setHasChanges(true);
  };

  // Handle saving a question edit
  const handleSaveQuestion = (id: number) => {
    setQuestions(questions.map(q => {
      if (q.id === id) {
        return { ...q, answer: editedAnswer, isEditing: false };
      }
      return q;
    }));
  };

  // Handle canceling a question edit
  const handleCancelEdit = (id: number) => {
    setQuestions(questions.map(q => {
      if (q.id === id) {
        return { ...q, isEditing: false };
      }
      return q;
    }));
  };


  // Handler for saving changes
  const handleApplyChanges = async () => {
    setProfile({
      ...profile,
    });
    setHasChanges(false)

    const sendQuestions = questions.map((q) => {
      return {
        question: q.question,
        selectedAnswer: q.answer,
      };
    });

    const details = await axios.patch(
      `http://localhost:3000/api/users/${userId}`,
      {
        profile: profile,
        questionnaire: sendQuestions
      },
      {
        headers: {
          'Content-Type': 'application/json',
        }
      }
    )

    setIsModalOpen(false)

    
    if(details)
      return alert("Changes applied successfully!")
    return alert("Changes Unsuccessful")
  };


  return (
    <div className="flex flex-col h-screen bg-blue-50">
      {/* Fixed header */}
      <header className="bg-blue-700 text-white p-4 sticky top-0 z-10">
        <h1 className="text-2xl font-bold">User Profile</h1>
      </header>
      
      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md mb-6">
            {/* Section 1: Profile Information */}
            <div className="p-6 border-b border-blue-100 ml-3">
              <h2 className="text-xl font-semibold text-blue-800 mb-4 ml-12">Profile</h2>
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="flex flex-col items-center ml-12">
                  <div className="relative">
                    <img
                      src={profile.profilePicture}
                      alt="User avatar"
                      className="w-24 h-24 rounded-full object-cover border-4 border-blue-200"
                    />
                </div>
                <br></br>
                <div className="flex-grow">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-blue-600">Username</label>
                    <div className="flex items-center mt-1">
                      <User size={18} className="text-blue-400 mr-2" />
                      <span className="text-gray-800">{profile.username}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-blue-600">Email</label>
                    <span className="text-gray-800" aria-disabled>{profile.email}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Questionnaire */}
            <br></br>
            <br></br>
            <div className="p-6 border-b border-blue-100">
              <h2 className="text-xl font-semibold text-blue-800 mb-4">Questionnaire</h2>
              <div className="space-y-4">
                {questions.map((q) => (
                  <div key={q.id} className="bg-blue-50 p-4 rounded-md">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium text-blue-700">{q.question}</h3>
                      {!q.isEditing && (
                        <button 
                          onClick={() => handleEditQuestion(q.id)}
                          className="text-blue-600 hover:text-blue-800 p-1"
                        >
                          <Edit size={16} />
                        </button>
                      )}
                    </div>
                    
                    {q.isEditing ? (
                      <div className="mt-2">
                        <input
                          type="text"
                          value={editedAnswer}
                          onChange={(e) => setEditedAnswer(e.target.value)}
                          className="w-full border border-blue-300 rounded p-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <div className="flex justify-end mt-2 space-x-2">
                          <button
                            onClick={() => handleCancelEdit(q.id)}
                            className="px-2 py-1 text-sm text-blue-700 border border-blue-700 rounded hover:bg-blue-50"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSaveQuestion(q.id)}
                            className="px-2 py-1 text-sm text-white bg-blue-600 rounded hover:bg-blue-700"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="mt-1 text-gray-700">{q.answer}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

              {/* Buttons */}
              <div className="flex justify-end space-x-4 mt-4">
                <button
                  onClick={handleApplyChanges}
                  disabled={!hasChanges}
                  className={`flex items-center px-4 py-2 rounded-md ${
                    hasChanges 
                      ? "bg-blue-700 text-white hover:bg-blue-800" 
                      : "bg-blue-300 text-white cursor-not-allowed"
                  }`}
                >
                  <Save size={16} className="mr-2" />
                  Apply Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Fixed footer */}
      <footer className="bg-blue-700 text-white p-4 text-center">
        <p className="text-sm">© 2025 Profile Manager</p>
      </footer>
    </div>
  );
};

export default EditProfileDetails;