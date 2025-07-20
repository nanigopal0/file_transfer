import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AiOutlineMenu } from 'react-icons/ai';

const NavBar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const token = localStorage.getItem('token');
    const location = useLocation();

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const isActive = (path) => location.pathname === path ? 'text-blue-500 bg-lime-200' : '';

    return (
        <div>
            <nav className="bg-white shadow-md fixed w-full z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center">
                            <Link to="/" className="text-2xl font-bold text-gray-800 flex items-center">

                                File Transfer
                            </Link>
                        </div>
                        <div className="hidden md:flex items-center space-x-6">
                            {token ? <>
                                <Link to="/request"
                                    className={`text-xl font-mono hover:text-white p-2 hover:bg-slate-600 transition duration-300 ${isActive('/request')}`}>Request</Link>
                                <Link to="/search"
                                    className={`text-xl font-mono  hover:text-white p-2 hover:bg-slate-600 transition duration-300 ${isActive('/search')}`}>Search</Link>
                                <Link to="/send" className={`text-xl font-mono  hover:text-white p-2 hover:bg-slate-600 transition duration-300 ${isActive('/send')}`}>Send</Link>
                                <Link to="/receive" className={`text-xl font-mono hover:text-white p-2 hover:bg-slate-600 transition duration-300 ${isActive('/receive')}`}>Receive</Link>
                                <Link to="/profile"
                                    className={`text-xl font-mono  hover:text-white p-2 hover:bg-slate-600 transition duration-300 ${isActive('/profile')}`}>Profile</Link>
                            </> :
                                <Link to="/register"
                                    className={`font-mono text-xl mx-4  hover:text-white p-2 hover:bg-slate-600 transition duration-300 ${isActive('/register')}`}>Register</Link>
                            }
                        </div>
                        <AiOutlineMenu className="md:hidden cursor-pointer mx-6" onClick={toggleMenu} size={24}
                            aria-label="Menu" />
                    </div>
                </div>
            </nav>

            <div
                className={`md:hidden ${isMenuOpen ? "block" : "hidden"} fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40`}
                onClick={toggleMenu} aria-hidden="true"></div>
            <div
                className={`md:hidden ${isMenuOpen ? "translate-x-0" : "translate-x-full"} fixed top-0 right-0 w-3/4 h-full bg-white z-50 transition-transform duration-300 backdrop-blur`}>
                <div className="flex flex-col h-full justify-start items-end p-10">
                    <button onClick={toggleMenu} className="text-2xl mb-4" aria-label="Close Menu">&#10005;</button>
                    {token ? <>
                        <Link to="/request"
                            className={`text-xl font-mono mb-4 hover:text-blue-500 transition duration-300 ${isActive('/request')}`}
                            onClick={toggleMenu}>Request</Link>
                        <Link to="/search"
                            className={`text-xl font-mono mb-4 hover:text-blue-500 transition duration-300 ${isActive('/search')}`}
                            onClick={toggleMenu}>Search</Link>
                        <Link to="/send"
                            className={`text-xl font-mono mb-4 hover:text-blue-500 transition duration-300 ${isActive('/send')}`}
                            onClick={toggleMenu}>Send</Link>
                        <Link to="/receive"
                            className={`text-xl font-mono mb-4 hover:text-blue-500 transition duration-300 ${isActive('/receive')}`}
                            onClick={toggleMenu}>Receive</Link>
                        <Link to="/profile"
                            className={`text-xl font-mono mb-4 hover:text-blue-500 transition duration-300 ${isActive('/profile')}`}
                            onClick={toggleMenu}>Profile</Link>
                    </> :
                        <Link to="/register"
                            className={`text-xl font-mono mb-4 hover:text-blue-500 transition duration-300 ${isActive('/register')}`}
                            onClick={toggleMenu}>Register</Link>
                    }
                </div>
            </div>
        </div>
    );
}

export default NavBar;