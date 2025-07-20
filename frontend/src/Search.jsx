import { useEffect, useState } from 'react';
import UserList from './components/UserList';
import SearchInput from './components/SearchInput';
import LoadingIndicator from './components/LoadingIndicator';
import { useWebSocket } from './providers/WebSocketProvider';

const Search = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false); // Add loading state

    const token = localStorage.getItem('token');
    const webSocket = useWebSocket();
    const [message, setMessage] = useState();

    useEffect(() => {

        const handleMessage = (event) => {
            const data = JSON.parse(event.data);
            // console.log('Received message:', event.data);
            switch (Number(data.statusCode)) {
                case 243: {
                    localStorage.setItem('wsId', data.id);
                    break;
                }
                case 389: {
                    if (data.payload.length === 0) {
                        setMessage('No users found');
                        setLoading(false);
                    }
                    else {
                        setUsers(data.payload);
                        setLoading(false);
                    }
                    break;
                }
            }
        };

        if (webSocket && webSocket.readyState === WebSocket.OPEN) {
            webSocket.addEventListener('message', handleMessage);
        }
        return () => {
            if (webSocket)
                webSocket.removeEventListener('message', handleMessage);

        }
    }, [webSocket]);


    const handleSearchClick = async (key) => {
        setLoading(true); // Set loading to true when search starts
        // Simulate an API call to fetch users
        setMessage(null);
        if (webSocket && webSocket.readyState === WebSocket.OPEN)
            webSocket.send(JSON.stringify({ statusCode: 378, searchKey: key }));

    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-100 p-4">
            <div className='flex justify-center mb-6'>
                <div className='w-full md:max-w-2xl'>
                    <p className='font-mono text-md text-center my-4'>Search receiver and click the send-icon to send a connection request.</p>
                    <SearchInput className='w-full max-w-2xl'
                        onSearch={handleSearchClick}
                    />
                </div>
            </div>
            <div className='flex justify-center'>
                <div className='w-full md:max-w-4xl'>
                    <p className='mx-4 text-xl font-bold mb-6'>Search results</p>
                    {message && <p className='text-gray-500'>{message}</p>}
                    <ul className='p-0 bg-white rounded-lg shadow-md'>
                        {loading ? <LoadingIndicator /> :
                            (users && users.map(user => (
                                <li key={user.id}>
                                    <UserList
                                        user={user}
                                    />
                                </li>

                            ))
                            )
                        }
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Search;