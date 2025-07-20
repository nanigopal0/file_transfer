import {createContext, useContext, useEffect, useState} from 'react';


// Create the WebSocket context
const WebSocketContext = createContext(null);

export const WebSocketProvider = ({children}) => {
    const [ws, setWs] = useState(null);

    useEffect(() => {
        // Initialize WebSocket when the provider is mounted
        const socket = new WebSocket(import.meta.env.VITE_SERVER_URL_WS);

        socket.onopen = () => {
            console.log("WebSocket connection established");
            setWs(socket);  // Set WebSocket instance in state
            socket.send(JSON.stringify({statusCode:234, token: localStorage.getItem('token')}));
        };

        socket.onclose = () => {
            console.log("WebSocket connection closed");
            setWs(null);  // Reset WebSocket state when closed
        };
        socket.onerror = (error) => {
            console.error("WebSocket error:", error);
            socket.close();  // Close the socket and trigger onclose
        }

        // Clean up WebSocket connection on unmount
        return () => {
            socket.close();
        };
    }, []);

    return (
        <WebSocketContext.Provider value={ws}>
            {children}
        </WebSocketContext.Provider>
    );
};

// Hook to use the WebSocket context
export const useWebSocket = () => {
    return useContext(WebSocketContext);
};
