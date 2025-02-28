import React, {useEffect, useState} from 'react';
import {useWebSocket} from './providers/WebSocketProvider';
import { useNavigate } from 'react-router-dom';

const Request = () => {
    const [requests, setRequests] = useState([]);
    const token = localStorage.getItem('token');
    const webSocket = useWebSocket();
    const navigate = useNavigate();
    const user = localStorage.getItem("user");

    useEffect(() => {

        const handleMessage = (event) => {
            const data = JSON.parse(event.data);
        
            switch (Number(data.statusCode)) {
                case 243: {
                    localStorage.setItem('wsId', data.id);
                    break;
                }
                case 340: {
                    setRequests(data.payload);
                    break;
                }
                case 204: {
                    setRequests(request => [...request, data.payload]);
                    break;
                }
                case 142: {
                    
                    setRequests(requests.map(request =>
                        request.id === data.payload.id ? {...request, status: data.connection.status} : request
                    ));
                    break;
                }
            }
        };

        if (webSocket && webSocket.readyState === WebSocket.OPEN) {
            webSocket.addEventListener('message', handleMessage);
            if(requests.length == 0)
                webSocket.send(JSON.stringify({statusCode: 447}));//send request for getting all connection requests
            
        }
        return () => {
            if (webSocket) {
                webSocket.removeEventListener('message', handleMessage);
            }
        };
    }, [webSocket]);

    const handleAccept = (id) => {
        
        navigate('/receive', {state: {userData: requests[id]}});

    };

    const handleDecline = (id) => {
        
        webSocket.send(JSON.stringify({statusCode: 142, connection: requests[id]}));

        setRequests(requests.map(request =>
            request.id === id ? {...request, status: 'declined'} : request
        ));
    };


    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center">
            <div className="bg-white p-8 rounded-lg w-full ">
                <h1 className="text-3xl font-bold mb-8 ">Connection Requests</h1>
                <ul className="space-y-4">
                    {requests.map((request, index) => (
                        <li key={index} className="bg-gray-200 p-4 rounded-lg shadow-md">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-lg font-bold">{(user.username == request.currentUserId) ? request.anotherUserFullName : request.currentUserFullName}</p>
                                    <p className={`font-mono text-sm 
                                         ${request.status === 'PENDING' ? 'text-yellow-500' : request.status === 'ACCEPTED' ? 'text-green-500' : 'text-red-500'}`}>  
                                        {request.status}
                                    </p>
                                    <p className='text-sm'>{request.connectionDate}</p>
                                </div>
                                {request.status === 'PENDING' && (user.username !== request.currentUserId) && (
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleAccept(index)}
                                            className="bg-green-500 text-white font-bold py-1 px-3 rounded-lg hover:bg-green-600 transition duration-300"
                                        >
                                            ACCEPT
                                        </button>
                                        <button
                                            onClick={() => handleDecline(index)}
                                            className="bg-red-500 text-white font-bold py-1 px-3 rounded-lg hover:bg-red-600 transition duration-300"
                                        >
                                            DECLINE
                                        </button>
                                    </div>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default Request;