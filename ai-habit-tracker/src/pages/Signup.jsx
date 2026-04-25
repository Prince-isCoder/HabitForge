import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Signup = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleSignup = async () => {
        const res = await fetch("http://localhost:5000/api/auth/signup", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ name, email, password })
        });

        const data = await res.json();

        if (data.message === "User created") {
            alert("Signup successful 🔥");
            navigate("/login");
        } else {
            alert(data.message || "Error");
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen text-white">
            <h2 className="text-2xl mb-4">Signup</h2>

            <input
                placeholder="Name"
                className="p-2 mb-2 bg-slate-700 rounded"
                onChange={(e) => setName(e.target.value)}
            />

            <input
                placeholder="Email"
                className="p-2 mb-2 bg-slate-700 rounded"
                onChange={(e) => setEmail(e.target.value)}
            />

            <input
                type="password"
                placeholder="Password"
                className="p-2 mb-2 bg-slate-700 rounded"
                onChange={(e) => setPassword(e.target.value)}
            />

            <button
                onClick={handleSignup}
                className="bg-green-600 px-4 py-2 rounded"
            >
                Signup
            </button>
        </div>
    );
};

export default Signup;