import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const EditProfile = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");

    const [username, setUsername] = useState(user.username);
    const [email, setEmail] = useState(user.email);
    const [fullName, setFullName] = useState(user.fullName);

    const handleSave = async () => {
        // Update user information in localStorage
        const updatedUser = { ...user, username, email, fullName };
        await fetch(
            `/api/user/update`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(updatedUser),
            }
        )
            .then(response => response.text())
            .then(data => {
                // const updatedUser = { ...user, username, email, fullName };
                localStorage.setItem("user", JSON.stringify(updatedUser));
                localStorage.setItem("token",data);
                navigate("/profile");
            })

            .catch(error => {
                console.error('Error:', error);
            })

    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md mt-4 border-4 border-gray-300">
                <h1 className="text-3xl font-bold mb-4">Edit Profile</h1>
                <form className="flex flex-col space-y-4">
                    <div>
                        <label className="block text-gray-700 font-bold mb-2">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 font-bold mb-2">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 font-bold mb-2">Full Name</label>
                        <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg"
                        />
                    </div>
                    <div className="flex justify-end space-x-4">
                        <button
                            type="button"
                            onClick={() => navigate("/profile")}
                            className="bg-gray-500 text-white font-bold py-2 px-4 rounded-lg shadow-lg hover:bg-gray-600 transition duration-300"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleSave}
                            className="bg-blue-500 text-white font-bold py-2 px-4 rounded-lg shadow-lg hover:bg-blue-600 transition duration-300"
                        >
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProfile;