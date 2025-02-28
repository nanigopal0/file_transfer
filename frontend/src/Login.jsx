import React, {useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {API_BASE_URL_HTTP} from './util/BaseUrl';
import LoadingIndicator from './components/LoadingIndicator';

function Login({onLogin}) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        // Handle form submission
        const data = {identifier: email, password: password};
        
        await fetch(`${API_BASE_URL_HTTP}/register/login`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            }
        ).then(response => {
            if (response.status == 200)
                return response.json();
            else throw new Error("Failed to login");
        })
            .then(response => {
               setLoading(false);
               localStorage.setItem('user', JSON.stringify(response.user));
                localStorage.setItem("token", response.token);
                onLogin();
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
                <h2 className="text-2xl font-bold mb-6 text-center font-mono">Login</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block font-mono text-gray-700 text-md mb-2" htmlFor="email">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="shadow appearance-none font-mono border border-gray-600 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            placeholder="Enter your email"
                            required
                        />
                    </div>
                    <div className="mb-6 relative">
                        <label className="block font-mono text-gray-700 text-md mb-2" htmlFor="password">
                            Password
                        </label>
                        <input
                            type={showPassword ? "text" : "password"}
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="shadow appearance-none font-mono border border-gray-600 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            placeholder="Enter your password"
                            required
                        />

                    </div>
                    <div className='w-full mb-6 flex justify-end'>
                        <Link to='/forgot-password' className="font-mono text-emerald-500 hover:text-emerald-700 text-md">Forgot
                            Password?</Link>
                    </div>

                    <div className="flex items-center md:justify-center">
                        <button
                            type="submit"
                            className="sm:w-full font-mono bg-emerald-500 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        >
                            Login
                        </button>
                    </div>
                </form>
                <p className="mt-4 font-mono text-center" >
                    Don't have an account?  
                    <Link to="/register" className="font-mono text-emerald-500 hover:text-emerald-700"> Register</Link>
                </p>
                {loading && <LoadingIndicator />}
            </div>
        </div>
    );
}

export default Login;