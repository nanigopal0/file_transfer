import {BsUpload} from "react-icons/bs";
import {useNavigate} from "react-router-dom";


function UserList({user}) {
    const navigate = useNavigate();

    const sendData = () => {
        navigate('/send', {state: {userData: user}});
    };

    return (
        <div key={user.id} className="p-4 border-b border-gray-200 text-lg flex justify-between items-center">
            <div>
                <p>{user.fullName}</p>
                <p className="text-gray-500 text-sm">@{user.username}</p>
            </div>
            <div className="flex space-x-5 mx-4">
                <BsUpload className="text-emerald-500 cursor-pointer" onClick={sendData}/>
               
            </div>
        </div>
    );

}

export default UserList;