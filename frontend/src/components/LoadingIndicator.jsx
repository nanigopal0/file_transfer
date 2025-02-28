import React from 'react';

const LoadingIndicator = () => {
    return (
        <div className="flex justify-center items-center p-4">
            <div className="loader border-t-4 border-blue-500 rounded-full w-12 h-12 animate-spin"></div>
        </div>
    );
};

export default LoadingIndicator;