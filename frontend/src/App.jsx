import { BrowserRouter, Route, Routes } from "react-router-dom";
import NavBar from "./components/NavBar";
import Receiver from "./Receiver";
import Sender from "./Sender";
import Request from "./Request";
import Search from "./Search";
import Register from "./Register";
import Login from "./Login";
import ForgotPassword from "./ForgotPassword";
import Profile from "./Profile";
import { WebSocketProvider } from "./providers/WebSocketProvider";
import { useEffect, useState } from "react";
import Home from "./Home";
import EditProfile from "./EditProfile";
import ColabTextEditor from "./ColabTextEditor";

function App() {
    const [token, setToken] = useState(localStorage.getItem("token"));

    const updateToken = () => {
        const t = localStorage.getItem("token");
        setToken(t);
    };

    useEffect(() => {
        const pingToServer = async () => {
            await fetch(`/api/ping`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            })
                .then((response) => {
                    if (response.status === 401) {
                        localStorage.removeItem("token");
                        setToken(null);
                    }
                })
                .catch((error) => {
                    console.error("Error:", error);
                });
        };
        pingToServer();
    }, [token]);

    return (
        <BrowserRouter>
            <NavBar />
            <div className="pt-16">
                {token && (
                    <WebSocketProvider>
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="*" element={<Home />} />
                            <Route path="/send" element={<Sender />} />
                            <Route path="/receive" element={<Receiver />} />
                            <Route path="/request" element={<Request />} />
                            <Route path="/search" element={<Search />} />
                            <Route path="/edit-profile" element={<EditProfile />} />
                            <Route
                                path="/profile"
                                element={<Profile onLogout={() => updateToken()} />}
                            />
                            <Route path="/colab-text-editor" element={<ColabTextEditor/>}/>
                        </Routes>
                    </WebSocketProvider>
                )}

                {!token && (
                    <Routes>
                        <Route
                            path="/register"
                            element={<Register onRegister={updateToken} />}
                        />
                        <Route path="/login" element={<Login onLogin={updateToken} />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/" element={<Home />} />
                        <Route path="*" element={<Home />} />
                    </Routes>
                )}
            </div>
        </BrowserRouter>
    );
}

export default App;
