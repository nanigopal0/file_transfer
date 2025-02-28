import React from "react";
import { useNavigate } from "react-router-dom";
import { IoMdPerson } from "react-icons/io";

const Profile = ({ onLogout }) => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user"));

    const logout = () => {
        localStorage.removeItem("token");
        onLogout();
        navigate("/login");
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md mt-4 border-4 border-gray-300">
                <div className="flex flex-col items-center">
                    <div className="border border-gray-600 rounded-full mb-4">
                        {user.profilePicture && user.profilePicture ? (
                            <img
                                src={user.profilePicture}
                                alt="Profile"
                                className="w-32 h-32 rounded-full p-2"
                            />
                        ) : (
                            <IoMdPerson className="w-32 h-32 p-2 text-gray-700 " />
                        )}
                    </div>
                    <p className="font-mono text-gray-700 text-md">@{user.username}</p>
                    <h1 className="text-3xl font-bold mb-2">{user.fullName}</h1>
                    <p className="text-gray-600 mb-4 font-mono">{user.email}</p>
                    <div className="flex space-x-4">
                        <button
                            className="bg-blue-500 text-white font-bold py-2 px-4 rounded-lg shadow-lg hover:bg-blue-600 transition duration-300"
                            onClick={() => navigate("/edit-profile")}
                        >
                            Edit Profile
                        </button>
                        <button
                            className="bg-red-500 text-white font-bold py-2 px-4 rounded-lg shadow-lg hover:bg-red-600 transition duration-300"
                            onClick={() => logout()}
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
