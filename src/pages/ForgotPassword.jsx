import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {

    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [msg, setMsg] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        const res = await fetch("http://localhost/vizsga/api/forgot_password.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email })
        });

        const text = await res.text();
        console.log(text);

        const data = JSON.parse(text);

        setMsg(data.message);

        // ✅ ha sikeres, átirányítás reset oldalra
        if (data.success && data.token) {
            navigate(`/reset-password?token=${data.token}`);
        }
    };

    return (
        <div className="max-w-md mx-auto bg-gray-900 p-8 rounded text-white mt-10">

            <h1 className="text-2xl font-bold text-red-600 mb-6 text-center">
                Elfelejtett jelszó
            </h1>

            <form onSubmit={handleSubmit} className="space-y-4">

                <input
                    type="email"
                    placeholder="E-mail címed"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-3 bg-black rounded border border-gray-700"
                />

                <button
                    type="submit"
                    className="w-full bg-red-600 hover:bg-red-700 p-3 rounded"
                >
                    Reset link küldése
                </button>

            </form>

            {msg && (
                <p className="text-center mt-4 text-green-400">
                    {msg}
                </p>
            )}

        </div>
    );
}