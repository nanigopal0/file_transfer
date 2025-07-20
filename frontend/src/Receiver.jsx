import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useWebSocket } from "./providers/WebSocketProvider";
import ProgressBar from "./components/ProgressBar";
import { CalculateFileSize } from "./util/CalculateFileSize";

const Receiver = () => {
    const [selectedCode, setSelectedCode] = useState("");
    const [progress, setProgress] = useState(0);
    const [receiving, setReceiving] = useState(false);
    const [fileReceived, setFileReceived] = useState(false);
    const [connectionRequest, setConnectionRequest] = useState([]);
    const [requestedFile, setRequestedFile] = useState([]);
    const [connected, setConnected] = useState(false);
    const [acceptOrDeniedRequestedFile, setAcceptOrDeniedRequestedFile] = useState(false);
    const [receiverId, setReceiverId] = useState(null);
    const [totalSize, setTotalSize] = useState(1);
    const totalSizeRef = useRef(totalSize);
    const currentUserDetails = JSON.parse(localStorage.getItem("user"));
    const receivedChunksRef = useRef([]);
    const downloadLinkRef = useRef(null);
    const location = useLocation();
    const webSocket = useWebSocket();
    const webRtcConnection = useRef(null);


    useEffect(() => {
        totalSizeRef.current = totalSize; // Update the ref value whenever totalSize changes
    }, [totalSize]);

    useEffect(() => {
        if (location.state) {
            setConnectionRequest(location.state.userData);
            setReceiverId(location.state.userData.currentUserId);
        }

        const handleMessage = (event) => {

            // let data = null;
            // if (event.data instanceof ArrayBuffer) {
            //     receivedChunksRef.current = [...receivedChunksRef.current, event.data]; // Store each chunk in the array
            //     const bytesReceived = receivedChunksRef.current.reduce((acc, chunk) => acc + chunk.byteLength, 0);

            //     const value = (bytesReceived / totalSizeRef.current) * 100;
            //     setProgress(parseFloat(value.toFixed(2)));
            //     return;
            // } else
            const data = JSON.parse(event.data);

            switch (Number(data.statusCode)) {

                case 202: {
                    //connected connection
                    setConnected(true);
                    webrtcSetup();
                    break;
                }
                case 406: {
                    //selected code wrong
                    setConnectionRequest(data.payload);
                    setConnected(false);
                    alert("Incorrect code. Please select the correct sender code.");
                    break;
                }
                case 504: {
                    //connection disconnected
                    handleDisconnectClick();
                    break;
                }
                case 422: {
                    //sender requested for receiving file

                    setTotalSize(Number(data.totalSize));
                    setReceiving(false);
                    setFileReceived(false);
                    setAcceptOrDeniedRequestedFile(false);
                    setRequestedFile(data);
                    break;
                }
                case 263: {
                    //file sent
                    mergeReceivedFile(data);
                    break;
                }
                case 252: {
                    //receive file chunk
                    setReceiving(true);
                    break;
                }
                case 384: {
                    //cancel file sending
                    receivedChunksRef.current = [];
                    break;
                }
                case 417: {//get existing connection

                    if (data.payload && data.payload.status == "CONNECTED" && data.payload.anotherUserId == currentUserDetails.username) {
                        setConnected(true);
                        setConnectionRequest(data.payload);
                        setReceiverId(data.payload.currentUserId);
                    }
                    break;
                }
                case 374: {
                    //receive offer
                    if (data.offer) {
                        rtcCreateAnswer(data.offer);
                    } else if (data.candidate) {
                        webRtcConnection.current.addIceCandidate(new RTCIceCandidate(data.candidate));
                    }
                    break;
                }
            }
        };

        if (webSocket) webSocket.binaryType = "arraybuffer";
        if (webSocket && webSocket.readyState === WebSocket.OPEN) {
            webSocket.addEventListener("message", handleMessage);
            if (!location.state) webSocket.send(JSON.stringify({ statusCode: 417 }));

        }
        return () => {
            if (webSocket) {
                webSocket.removeEventListener("message", handleMessage);
            }
            closeConnection();
        };
    }, [webSocket]);

    const rtcCreateAnswer = async (offer) => {
        webRtcConnection.current.setRemoteDescription(offer);
        const answer = await webRtcConnection.current.createAnswer();

        webRtcConnection.current.setLocalDescription(answer).then(() => {
            webSocket.send(JSON.stringify({ statusCode: 374, answer: answer }));
        });
    }

    const webrtcSetup = async () => {
        // Calling the REST API TO fetch the TURN Server Credentials
        const response =
            await fetch(`https://file-transfer.metered.live/api/v1/turn/credentials?apiKey=${import.meta.env.VITE_OPENRELAYPROJECT_API_KEY}` );

        // Saving the response in the iceServers array
        const iceServers = await response.json();

        const peerconnection = new RTCPeerConnection({ iceServers: iceServers });

        webRtcConnection.current = peerconnection;
        receiveMessage();
        // Handle ICE candidates
        peerconnection.onicecandidate = (event) => {
            if (event.candidate) {
                webSocket.send(JSON.stringify({ statusCode: 374, candidate: event.candidate }));
            }
        };
    }

    const receiveMessage = () => {
        webRtcConnection.current.ondatachannel = (event) => {
            const dataChannel = event.channel;
            webRtcConnection.current.dataChannel = dataChannel;
            dataChannel.binaryType = "arraybuffer";

            dataChannel.onmessage = (event) => {
                if (typeof event.data === 'string') {
                    const data = JSON.parse(event.data);
                    if (data.statusCode === 263) {
                        mergeReceivedFile(data);
                    }
                }
                if (event.data instanceof ArrayBuffer) {
                    receivedChunksRef.current = [...receivedChunksRef.current, event.data]; // Store each chunk in the array
                    const bytesReceived = receivedChunksRef.current.reduce((acc, chunk) => acc + chunk.byteLength, 0);

                    const value = (bytesReceived / totalSizeRef.current) * 100;

                    setProgress(parseFloat(value.toFixed(2)));
                }
            };
            dataChannel.onstatechange = () => {
                console.log('Data channel state:', dataChannel.readyState);
            };
            dataChannel.onerror = (error) => {
                console.error('Data channel error:', error);
            }
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

    const handleCodeSelect = (code) => {
        setSelectedCode(code);
        if (webSocket && webSocket.readyState === WebSocket.OPEN) {
            webSocket.send(
                JSON.stringify({ statusCode: 382, code: code, senderId: receiverId })
            );
        }
    };

    const handleReceiveClick = () => {
        setReceiving(true);
        setProgress(0);
        if (webSocket && webSocket.readyState === WebSocket.OPEN)
            webSocket.send(
                JSON.stringify({ statusCode: 388, fileName: requestedFile.fileName })
            );
        setAcceptOrDeniedRequestedFile(true);
    };

    const handleIgnoreFileClick = () => {
        if (webSocket && webSocket.readyState === WebSocket.OPEN)
            webSocket.send(
                JSON.stringify({ statusCode: 444, fileName: requestedFile.fileName })
            );
        setAcceptOrDeniedRequestedFile(true);
    };

    const mergeReceivedFile = (data) => {
        const completeFile = new Blob(receivedChunksRef.current, {
            type: "application/octet-stream",
        });
        downloadLinkRef.current.href = URL.createObjectURL(completeFile);
        downloadLinkRef.current.download = data?.fileName;
        if (webSocket && webSocket.readyState === WebSocket.OPEN)
            webSocket.send(
                JSON.stringify({ statusCode: 267, fileName: data.fileName })
            );
        setFileReceived(true);
        receivedChunksRef.current = [];
        setReceiving(false);
        setProgress(0);
    };

    const requestToDisconnect = () => {
        if (webSocket && webSocket.readyState === WebSocket.OPEN) {
            webSocket.send(JSON.stringify({ statusCode: 508 }));
        }
        handleDisconnectClick();
    };
    const handleDisconnectClick = () => {
        setConnected(false);
        setReceiving(false);
        setFileReceived(false);
        setSelectedCode("");
        setReceiverId(null);
        setProgress(0);
        setAcceptOrDeniedRequestedFile(false);
        setRequestedFile([]);
        setConnectionRequest([]);
        closeConnection();
    };

    const handleDownloadClick = () => {
        downloadLinkRef.current.click();
        URL.revokeObjectURL(downloadLinkRef.current.href);
    };
    const generateCodes = (code) => {
        return [
            parseInt(code.slice(0, 2)),
            parseInt(code.slice(2, 4)),
            parseInt(code.slice(4, 6)),
        ];
    };

    return (
        <div className=" flex flex-col md:items-center md:bg-gray-100 ">
            <div
                className={`p-8 rounded-lg w-full md:max-w-4xl ${connectionRequest ? "block" : "hidden"}`}
            >
                {!connected && (
                    <div>
                        {connectionRequest.length == 0 ? (
                            <div>
                                <p className="text-red-500 text-2xl text-center mt-4 font-mono font-bold">
                                    Connection disconnected
                                </p>
                                <p className="text-center font-mono my-2">Go to <Link to="/request" className="text-blue-600">Request</Link> to receive a connection request.</p>

                            </div>
                        ) : (
                            <div>
                                <h1 className="text-2xl font-mono font-bold mb-4 text-center">
                                    Select {connectionRequest.currentUserFullName}'s code
                                </h1>
                                <div className="flex justify-around mb-4">
                                    {connectionRequest.length != 0 &&
                                        generateCodes(
                                            connectionRequest.connectionCode.toString()
                                        ).map((code) => (
                                            <div
                                                key={code}
                                                className={`w-16 h-16 flex font-mono items-center justify-center rounded-full cursor-pointer 
                                                ${selectedCode === code
                                                        ? "bg-blue-500 text-white"
                                                        : "bg-gray-200"
                                                    }`}
                                                onClick={() => handleCodeSelect(code)}
                                            >
                                                {code}
                                            </div>
                                        ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
                {connected && (
                    <div>
                        <p className="font-mono text-green-600 text-lg font-bold mb-5">
                            Connected with {connectionRequest.currentUserFullName}
                        </p>

                        {requestedFile?.fileName &&
                            !receiving &&

                            !fileReceived &&
                            !acceptOrDeniedRequestedFile && (
                                <div>
                                    <p className="text-start font-mono text-lg mb-4">
                                        {connectionRequest.currentUserFullName} wants to send{" "}
                                        {requestedFile?.fileName}  ({CalculateFileSize(totalSize)})
                                    </p>
                                    <div className="flex my-4">
                                        <button
                                            onClick={handleReceiveClick}
                                            className="w-full font-mono bg-green-500 text-white p-2 me-4 rounded-lg hover:bg-green-600 transition duration-300"
                                        >
                                            Receive file
                                        </button>
                                        <button
                                            onClick={handleIgnoreFileClick}
                                            className="w-full font-mono bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition duration-300"
                                        >
                                            Ignore file
                                        </button>
                                    </div>
                                </div>
                            )}

                        <div className="w-2/3 mb-5" hidden={!receiving}>
                            <p className="font-mono text-lg mb-5">
                                Receiving {requestedFile?.fileName} ({CalculateFileSize(totalSize)})
                            </p>
                            <ProgressBar progress={progress} />
                        </div>
                        <p
                            className={`font-mono mb-5 text-lg text-teal-600 ${fileReceived ? "visible" : "hidden"
                                }`}
                        >
                            {requestedFile?.fileName} ({CalculateFileSize(totalSize)}) received!
                        </p>
                        <button
                            className={`bg-purple-700 border-2 text-white font-mono p-3 rounded-lg shadow-lg
         hover:bg-purple-900 mb-5 md:w-40 lg:w-40  hover:shadow-purple-400 
         hover:text-lg hover:p-4 hover:font-bold ${fileReceived ? "visible" : "hidden"
                                }`}
                            onClick={handleDownloadClick}
                        >
                            Download
                        </button>
                        <a href="" ref={downloadLinkRef} className="hidden"></a>
                        <button
                            className="bg-orange-700 border-2 text-white font-mono p-3 rounded-lg shadow-lg
         hover:bg-orange-900 mb-5 md:w-40 lg:w-40"
                            disabled={receiving}
                            onClick={requestToDisconnect}
                        >
                            Disconnect
                        </button>
                    </div>
                )}
                <p className="text-sm text-center text-orange-400 font-mono font-medium">
                    * Please stay on this page while receiving file
                </p>
            </div>
        </div>
    );
};

export default Receiver;
