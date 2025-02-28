import React, {useState} from 'react';
import {Link} from 'react-router-dom';

function ForgotPassword() {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleRequestOtp = (e) => {
        e.preventDefault();
        // Handle OTP request
        console.log({email});
        setStep(2);
    };

    const handleVerifyOtp = (e) => {
        e.preventDefault();
        // Handle OTP verification
        console.log({email, otp});
        setStep(3);
    };

    const handleResetPassword = (e) => {
        e.preventDefault();
        // Handle password reset
        if (newPassword === confirmPassword) {
            console.log({email, newPassword});
            // Redirect to login or show success message
        } else {
            alert("Passwords do not match");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                {step === 1 && (
                    <>
                        <h2 className="text-2xl font-bold mb-6 text-center">Forgot Password</h2>
                        <form onSubmit={handleRequestOtp}>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    placeholder="Enter your email"
                                    required
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <button
                                    type="submit"
                                    className="bg-emerald-500 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                >
                                    Request OTP
                                </button>
                            </div>
                        </form>
                    </>
                )}
                {step === 2 && (
                    <>
                        <h2 className="text-2xl font-bold mb-6 text-center">Verify OTP</h2>
                        <form onSubmit={handleVerifyOtp}>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="otp">
                                    OTP
                                </label>
                                <input
                                    type="text"
                                    id="otp"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    placeholder="Enter the OTP"
                                    required
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <button
                                    type="submit"
                                    className="bg-emerald-500 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                >
                                    Verify OTP
                                </button>
                            </div>
                        </form>
                    </>
                )}
                {step === 3 && (
                    <>
                        <h2 className="text-2xl font-bold mb-6 text-center">Reset Password</h2>
                        <form onSubmit={handleResetPassword}>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="newPassword">
                                    New Password
                                </label>
                                <input
                                    type="password"
                                    id="newPassword"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    placeholder="Enter your new password"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirmPassword">
                                    Confirm Password
                                </label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    placeholder="Confirm your new password"
                                    required
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <button
                                    type="submit"
                                    className="bg-emerald-500 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                >
                                    Reset Password
                                </button>
                            </div>
                        </form>
                    </>
                )}
                <p className="mt-4 text-center">
                    Remembered your password? <Link to="/login"
                                                    className="text-emerald-500 hover:text-emerald-700">Login</Link>
                </p>
            </div>
        </div>
    );
}

export default ForgotPassword;