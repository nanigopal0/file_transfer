import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useWebSocket } from "./providers/WebSocketProvider";
import ProgressBar from "./components/ProgressBar";
import LoadingIndicator from "./components/LoadingIndicator";
import { CalculateFileSize } from "./util/CalculateFileSize";


const Sender = () => {
    const file = useRef(null);
    const [isFileSelected, setIsFileSelected] = useState(false);
    const [progress, setProgress] = useState(0);
    const [sending, setSending] = useState(false);
    const [isFileReceived, setIsFileReceived] = useState(false);
    const [connected, setConnected] = useState(false);
    const [disconnected, setDisconnected] = useState(false);
    const [isSendButtonClicked, setIsSendButtonClicked] = useState(false);
    const [isReceiverDenied, setIsReceiverDenied] = useState(false);
    const [receiverAcceptOrDeniedFileRequest, setReceiverAcceptOrDeniedFileRequest] = useState(false);
    const [receiverData, setReceiverData] = useState([]);
    const [cancelFile, setCancelFile] = useState(false);
    const [isConnectionAlreadySent, setIsConnectionAlreadySent] = useState(false);
    const [loadingIndicator, setLoadingIndicator] = useState(false);
    const sender = JSON.parse(localStorage.getItem("user"));
    const CHUNK_SIZE = 1024 * 256; // 256KB per chunk
    const MAX_BUFFER_SIZE = 14 * 1024 *1024; // 14MB
    const location = useLocation();
    const [userData, setUserData] = useState(location.state?.userData);
    const webSocket = useWebSocket();
    const navigate = useNavigate();
    const webRtcConnection = useRef(null);

    useEffect(() => {

        const handleMessage = (event) => {
            const data = JSON.parse(event.data);

            switch (Number(data.statusCode)) {

                case 202: {
                    // connected connection
                    setConnected(true);
                    setDisconnected(false);
                    webrtcSetup();
                    break;
                }
                case 204: {
                    // new connection request message
                    setReceiverData(data.payload);
                    setLoadingIndicator(false);
                    break;
                }
                case 406: {
                    // receiver selects wrong code
                    setReceiverData(data.payload);
                    break;
                }
                case 504: {
                    // connection disconnects
                    handleDisconnectClick();
                    break;
                }
                case 142: {
                    // receiver declined to request the connection
                    handleDisconnectClick();
                    break;
                }
                case 388: {
                    //Receiver accept to receive file
                    setReceiverAcceptOrDeniedFileRequest(true);
                    sendFile();
                    if (cancelFile) setCancelFile(false);
                    break;
                }
                case 444: {
                    //receiver denied to receive file
                    setIsSendButtonClicked(false);
                    setReceiverAcceptOrDeniedFileRequest(true);
                    setSending(false);
                    setIsReceiverDenied(true);
                    break;
                }
                case 384: {
                    //cancel file sending
                    setCancelFile(true);
                    break;
                }
                case 267: {
                    //file receving completed
                    setIsFileReceived(true);
                    setProgress(0);

                    setIsSendButtonClicked(false);
                    break;
                }
                case 417: {//get existing connection
                    if (data.payload && data.payload.status == "CONNECTED" && data.payload.currentUserId == sender.username) {
                        if (webSocket && webSocket.readyState === WebSocket.OPEN)
                            webSocket.send(JSON.stringify({ statusCode: 356, username: data.payload.anotherUserId }));
                        setReceiverData(data.payload);
                    }
                    setLoadingIndicator(false);
                    break;
                }
                case 409: {//connection request already sent
                    setIsConnectionAlreadySent(true);
                    break;
                }
                case 356: { //find receiver by username
                    if (!data.payload) navigate("/");
                    else {
                        setUserData(data.payload);
                        setDisconnected(false);
                        setConnected(true);
                    }
                    break;
                }
                case 374: {

                    if (data.answer)
                        webRtcConnection.current.setRemoteDescription(data.answer);

                    if (data.candidate) {
                        webRtcConnection.current.addIceCandidate(new RTCIceCandidate(data.candidate));
                    }
                    break;
                }
            }
        };

        if (webSocket && webSocket.readyState === WebSocket.OPEN) {
            webSocket.addEventListener("message", handleMessage);
            if (!userData) webSocket.send(JSON.stringify({ statusCode: 417 }));
            else sendRequest();
            setLoadingIndicator(true);
        }

        return () => {
            if (webSocket) {
                webSocket.removeEventListener("message", handleMessage);
            }
            closeConnection();
        };
    }, [webSocket]);

    const webrtcSetup = async () => {
        // Calling the REST API TO fetch the OpenRelayProject (Metered) TURN Server Credentials
        const response =
            await fetch(`https://file-transfer.metered.live/api/v1/turn/credentials?apiKey=${import.meta.env.VITE_OPENRELAYPROJECT_API_KEY}`);

        // Saving the response in the iceServers array
        const iceServers = await response.json();
  
        const peerconnection = new RTCPeerConnection({iceServers: iceServers});
        webRtcConnection.current = peerconnection;

        sendMessageViaRtc();
        // Handle ICE candidate 
        peerconnection.onicecandidate = (event) => {
            if (event.candidate) {
                webSocket.send(JSON.stringify({ statusCode: 374, candidate: event.candidate }));
            }
        };
        const offer = await peerconnection.createOffer();
        await peerconnection.setLocalDescription(offer).then(() => {
            webSocket.send(JSON.stringify({ statusCode: 374, offer: offer }))
        });
    }

    const sendMessageViaRtc = () => {
        const dataChannel = webRtcConnection.current.createDataChannel("transfer-file");
        webRtcConnection.current.dataChannel = dataChannel;
        dataChannel.onopen = () => {
            console.log('Data channel open');
            
        };
        dataChannel.onstatechange = () => {
            console.log('Data channel state:', dataChannel.readyState);
        };
        dataChannel.onerror = (error) => {
            console.error('Data channel error:', error);
        }
         // Monitor buffer status
    dataChannel.onbufferedamountlow = () => {
        console.log('Buffered amount low:', dataChannel.bufferedAmount);
    };
    }

    const closeConnection = () => {
        if (webRtcConnection.current) {
            // Close the data channel
            if (webRtcConnection.current.dataChannel) {
                webRtcConnection.current.dataChannel.close();
            }
            // Close the peer connection
            webRtcConnection.current.close();

            // Clear the connection
            webRtcConnection.current = null;
        }
    };

    const sendRequest = () => {
        if (userData && webSocket) {
            webSocket.send(
                JSON.stringify({
                    statusCode: 204,
                    receiver: userData,
                    sender: sender,
                })
            );
        }
    };

    const sendFile = async () => {
        if (file.current) {
            const totalChunks = Math.ceil(file.current.size / CHUNK_SIZE);
            const filename = file.current.name;
            let bytesSent = 0;

            setSending(true);
            setProgress(0);
             // Set the bufferedAmountLowThreshold to control when the bufferedamountlow event is triggered
        webRtcConnection.current.dataChannel.bufferedAmountLowThreshold = MAX_BUFFER_SIZE / 2;

            for (let i = 0; i < totalChunks; i++) {
                //break loop if cancel sending file
                if (cancelFile) return;
                const start = i * CHUNK_SIZE;
                const end = Math.min(file.current.size, start + CHUNK_SIZE);
                const chunk = file.current.slice(start, end);

                const fileData = await readFileChunk(chunk);

            // Wait until the buffer has enough space
            while (webRtcConnection.current.dataChannel.bufferedAmount > MAX_BUFFER_SIZE) {
                await new Promise(resolve => {
                    const onBufferedAmountLow = () => {
                        webRtcConnection.current.dataChannel.removeEventListener('bufferedamountlow', onBufferedAmountLow);
                        resolve();
                    };
                    webRtcConnection.current.dataChannel.addEventListener('bufferedamountlow', onBufferedAmountLow);
                });
            }
                // webSocket.send(fileData);
                if (webRtcConnection.current.dataChannel.readyState === 'open') {
                    webRtcConnection.current.dataChannel.send(fileData);
                } else {
                    console.error('Data channel closed');
                    break;
                }

                bytesSent += chunk.size;
                const value = (bytesSent / file.current.size) * 100;
                setProgress(parseFloat(value.toFixed(2)));
            }

            const fileMessage = {
                statusCode: 263,
                fileName: filename
            };
            // webSocket.send(JSON.stringify(fileMessage));
            webRtcConnection.current.dataChannel.send(JSON.stringify(fileMessage));

            setSending(false);

        }
    };

    // Helper function to read a file chunk as an ArrayBuffer (returns a Promise)
    function readFileChunk(chunk) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = function (event) {
                resolve(event.target.result); // Resolve with the chunk data (ArrayBuffer)
            };
            reader.onerror = function () {
                reject("Failed to read file chunk");
            };
            reader.readAsArrayBuffer(chunk); // Read the chunk as an ArrayBuffer
        });
    }

    const handleFileChange = (e) => {
        file.current = e.target.files[0];
        if (file.current) setIsFileSelected(true);
        else setIsFileSelected(false);
    };

    const handleSendClick = () => {
        setIsReceiverDenied(false);

        if (webSocket && webSocket.readyState === WebSocket.OPEN && connected)
            webSocket.send(
                JSON.stringify({ statusCode: 422, fileName: file.current.name, totalSize: file.current.size })
            );
        setIsSendButtonClicked(true);
        setReceiverAcceptOrDeniedFileRequest(false);
        setIsFileReceived(false);
    };

    const handleCancelClick = () => {
        setSending(false);
        setIsFileReceived(false);
        setProgress(0);
        if (webSocket && webSocket.readyState === WebSocket.OPEN)
            webSocket.send(
                JSON.stringify({ statusCode: 384, fileName: file.current.name })
            );
    };

    const requestToDisconnect = () => {
        if (webSocket && webSocket.readyState === WebSocket.OPEN)
            webSocket.send(JSON.stringify({ statusCode: 508 }));
        handleDisconnectClick();
    };

    const handleDisconnectClick = () => {
        setConnected(false);
        setSending(false);
        setProgress(0);
        setDisconnected(true);
        setCancelFile(false);
        setIsFileReceived(false);
        setIsFileSelected(false);
        setIsReceiverDenied(false);
        setReceiverData([]);
        setIsSendButtonClicked(false);
        closeConnection();
        file.current = null;
    };

    return (
        <div className="flex flex-col md:items-center md:bg-gray-100 ">
            <div className=" p-8 rounded-lg w-full md:max-w-4xl  ">
                {!userData &&
                    <div>
                        {loadingIndicator ? <LoadingIndicator />
                            : <p className="text-center font-mono my-2">Go to <Link to="/search" className="text-blue-600">Search</Link> to send a connection request to receiver.</p>}
                    </div>
                }
                {isConnectionAlreadySent && (
                    <div className="text-center font-mono mb-4">
                        <h1 className="text-2xl font-bold mb-4 text-center text-red-600">
                            Connection request already sent
                        </h1>
                        <p className="text-lg font-mono text-center mb-3">Refresh this page or close the tab from the browser to send new connection request.</p>
                    </div>
                )}
                {!connected && userData && receiverData.length != 0 && !disconnected && (
                    <div className="text-center mb-4">
                        <h1 className="text-2xl font-bold mb-4 font-mono text-center">
                            Waiting for {userData?.fullName} ...
                        </h1>
                        <p className="text-lg font-mono mb-2">
                            Your Code: {receiverData.connectionCode}
                        </p>
                    </div>
                )}
                {disconnected && (
                    <div className="text-center font-mono mb-4">
                        <h1 className="text-2xl font-bold mb-4 text-center text-red-600">
                            Connection disconnected
                        </h1>
                    </div>
                )}

                {connected && receiverData && (
                    <div className={`flex flex-col justify-center align-middle `}>
                        <p className="font-mono text-green-600 text-lg font-bold">
                            Connected with {userData.fullName} 
                        </p>

                        <Link to="/colab-text-editor" className='bg-green-500 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-green-600 transition duration-300'
                        >Access colaborative Text Editor</Link>

                        <p className="font-mono text-lg font-bold my-4">Send file</p>
                        <input
                            type="file"
                            className="w-full p-2 border border-gray-300 rounded-lg mb-4 disabled:cursor-not-allowed"
                            disabled={isSendButtonClicked}
                            onChange={handleFileChange}
                        />

                        {!sending && isReceiverDenied && file.current && (
                            <div className="text-lg font-mono text-red-600">
                                {userData.fullName} denied to receive{" "}
                                {file.current && file.current.name}
                            </div>
                        )}

                        <div className={`w-2/3 mb-4 ${(receiverAcceptOrDeniedFileRequest && isSendButtonClicked) ? "visible" : "hidden"}`}>
                            <p className="font-mono mb-5 text-lg">
                                Sending {file.current && file.current.name} ({file.current && CalculateFileSize(file.current.size)})...
                            </p>
                            <ProgressBar progress={progress} />
                            <button
                                hidden={!sending}
                                onClick={handleCancelClick}
                                className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition duration-300"
                            >
                                Cancel
                            </button>
                        </div>

                        <p className={`text-md font-mono font-bold ${!isReceiverDenied && isFileReceived ? "visible" : "hidden"} text-yellow-800 mb-4`}>
                            {file.current && file.current.name} ({file.current && CalculateFileSize(file.current.size)}) sent successfully
                        </p>

                        <p
                            className={`text-md font-mono font-medium mb-4 ${!receiverAcceptOrDeniedFileRequest && isSendButtonClicked
                                ? "visible"
                                : "hidden"
                                }`}
                        >
                            Waiting for {userData.fullName} confirmation
                        </p>

                        <button
                            className="bg-purple-700 border-2 text-white font-mono p-3 rounded-lg shadow-lg
                     hover:bg-purple-900 mb-5 md:w-40 lg:w-40 disabled:bg-gray-500 disabled:opacity-60 disabled:cursor-not-allowed"
                            onClick={handleSendClick}
                            disabled={sending || !isFileSelected || isSendButtonClicked}
                        >
                            Send file
                        </button>

                        <button
                            className="bg-orange-700 border-2 text-white font-mono p-3 rounded-lg shadow-lg
                     hover:bg-orange-900 mb-5 md:w-40 lg:w-40 disabled:bg-gray-500 disabled:opacity-60 disabled:cursor-not-allowed"
                            disabled={sending}
                            onClick={() => {
                                requestToDisconnect();
                            }}
                        >
                            Disconnect
                        </button>
                    </div>
                )}
                <p className='text-md text-orange-400 font-mono font-medium'>* Please stay on this page while sending file</p>
            </div>
        </div>
    );
};

export default Sender;
