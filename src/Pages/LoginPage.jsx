import React, { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import axiosInstance from "../utils/axioesInstance";
import { useNavigate } from "react-router-dom";
import Spinner from "../Components/Spinner";

export default function LoginCard() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    axiosInstance.get("/admin/check")
      .then((res) => {
        if (res.data.ok) {
          toast.success("Welcome back!");
          navigate("/admin");
        } else {
          setChecking(false);
        }
      })
      .catch(() => {
        setChecking(false);
      });
  }, [navigate]);

  if (checking) return <Spinner />;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("कृपया सर्व फील्ड भरा"); // Marathi: Please fill all fields
      return;
    }

    setLoading(true);
    try {
      const res = await axiosInstance.post(
        "/admin/login", // admin auth route
        { email, password }
      );

      if (res.data.success) {
        toast.success("Login successful!");
        navigate("/admin");
      }
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data) {
        toast.error(err.response.data.error || "Login failed");
      } else {
        toast.error("Server error. Try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <Toaster position="top-center" reverseOrder={false} />

      <div className="flex flex-col md:flex-row w-full max-w-4xl h-auto md:h-[400px] bg-white shadow-2xl rounded-2xl overflow-hidden">
        {/* Left Part */}
        <div className="relative w-full md:w-1/2 h-48 md:h-auto">
          <img
            src="/images/nature1.jpg"
            alt="background"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <h1 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-2/11 text-2xl md:text-4xl font-extrabold text-white drop-shadow-lg font-serif text-center">
            ग्रामपंचायत गोमेवाडी
          </h1>
        </div>

        {/* Right Part */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-8">
          <form onSubmit={handleSubmit} className="w-full max-w-sm">
            <h2 className="text-2xl font-bold mb-2 text-green-800">Login</h2>
            <p className="text-gray-500 mb-6">Only admins can login</p>

            <div className="mb-4">
              <label className="block text-sm text-gray-700">Email</label>
              <input
                type="email"
                className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-green-300 focus:outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm text-gray-700">Password</label>
              <input
                type="password"
                className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-green-300 focus:outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
