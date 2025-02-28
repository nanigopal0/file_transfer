import React from 'react';
import {Link} from 'react-router-dom';

const Home = () => {
    const token = localStorage.getItem('token');
    
    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center text-gray-800 p-4">
            <h1 className="text-5xl font-bold mb-8">Welcome to File Transfer</h1>
            <p className="text-xl mb-8 text-center max-w-2xl">
                Seamlessly send and receive files with ease. Our platform ensures secure and fast file transfers, making
                it the perfect solution for all your file sharing needs.
            </p>
            <div className="flex space-x-4">
                {token ?
                    <>
                        <Link to="/search"
                              className="bg-orange-500 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-orange-600 transition duration-300">
                            Send a File
                        </Link>

                        {/* <Link to="/receive"
                              className="bg-blue-500 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-blue-600 transition duration-300">
                            Receive a File
                        </Link> */}
                    </>
                    :
                    <Link to="/login"
                          className="bg-blue-500 text-white font-bold py-4 px-8 rounded-lg shadow-lg hover:bg-blue-600 transition duration-300">
                        Get started
                    </Link>
                }
            </div>
            <div className="mt-12 text-center">
                <h2 className="text-3xl font-bold mb-4">Features</h2>
                <ul className="text-lg space-y-2">
                    <li>🔒 Secure Transfers</li>
                    <li>⚡ Fast and Reliable</li>
                    <li>📁 Easy to Use</li>
                </ul>
            </div>
        </div>
    );
};

export default Home;