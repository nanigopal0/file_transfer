import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import LoadingIndicator from './components/LoadingIndicator';

function Register({ onRegister }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        // Handle form submission
        const data = {
            id: 0,
            fullName: name,
            email: email,
            password: password
        };
        await fetch(`/api/register/signup`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            }
        ).then(response => {
            setLoading(false);
            if (response.status == 200)
                return response.json();
            else throw new Error("Failed to register");
        })
            .then(response => {
                localStorage.setItem('user', JSON.stringify(response.user));
                localStorage.setItem("token", response.token);
                onRegister();
                navigate("/");
            })
            .catch(error => {
                setLoading(false);
                console.error('Error:', error);
            });
    };

    return (
        <div className="md:min-h-screen flex md:items-center justify-center md:bg-gray-100">
            <div className="bg-white p-8 rounded-lg md:shadow-lg w-full md:max-w-md">
                <h2 className="text-2xl font-bold mb-6 font-mono text-center">Register</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-md font-mono mb-2" htmlFor="name">
                            Fullname
                        </label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="shadow appearance-none border border-gray-600 font-mono rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            placeholder="Enter your full name"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-md font-mono mb-2" htmlFor="email">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="shadow appearance-none border border-gray-600 font-mono rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            placeholder="Enter your email"
                            required
                        />
                    </div>
                    <div className="mb-6 relative">
                        <label className="block text-gray-700 text-md font-mono mb-2" htmlFor="password">
                            Password
                        </label>
                        <input
                            type={showPassword ? "text" : "password"}
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="shadow appearance-none border border-gray-600 font-mono rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            placeholder="Enter your password"
                            required
                        />

                    </div>

                    <div className="flex items-center  md:justify-between">
                        <button
                            type="submit"
                            className="bg-emerald-500 font-mono sm:w-full hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        >
                            Register
                        </button>
                    </div>
                </form>
                <p className="mt-4 text-center font-mono">
                    Already have an account? <Link to="/login"
                        className="text-emerald-500 font-mono hover:text-emerald-700">Login</Link>
                </p>
                {loading && <LoadingIndicator />}
            </div>
        </div>
    );
}

export default Register;