import { Eye, EyeOff, Lock, Mail, UserPlus } from "lucide-react";
import React, { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { BUTTON_CLASSES, INPUTWRAPPER } from "../assets/dummy.jsx";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const INITIAL_FORM = { name: "", email: "", password: "" };

const SignUp = ({ onSubmit, onSwitchMode }) => {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const url = "http://localhost:4000";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await axios.post(`${url}/api/user/signup`, formData);

      if (!data.token) throw new Error(data.message || "Signup failed");

      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.user.id);

      setFormData(INITIAL_FORM);

      onSubmit?.({
        token: data.token,
        userId: data.user.id,
        email: data.user.email,
        name: data.user.name,
      });

      toast.success("Signup successful! Redirecting...");
      setTimeout(() => navigate("/"), 1000);
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchMode = () => {
    toast.dismiss();
    onSwitchMode?.();
  };

  const fields = [
    { name: "name", type: "text", placeholder: "Full Name", icon: UserPlus },
    { name: "email", type: "email", placeholder: "Email", icon: Mail },
    {
      name: "password",
      type: showPassword ? "text" : "password",
      placeholder: "Password",
      icon: Lock,
      isPassword: true,
    },
  ];

  return (
    <div className="max-w-md bg-white w-full shadow-lg border border-purple-100 rounded-xl p-8">
      <ToastContainer position="top-center" autoClose={3000} hideProgressBar />
      <div className="mb-6 text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-fuchsia-500 to-purple-600 rounded-full mx-auto flex items-center justify-center mb-4">
          <UserPlus className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Create Account</h2>
        <p className="text-gray-500 text-sm mt-1">
          Sign up to get started with TaskFlow
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        {fields.map(({ name, type, placeholder, icon: Icon, isPassword }) => (
          <div key={name} className={INPUTWRAPPER}>
            <Icon className="text-purple-500 w-5 h-5 mr-2" />
            <input
              type={isPassword ? (showPassword ? "text" : "password") : type}
              placeholder={placeholder}
              value={formData[name]}
              onChange={(e) =>
                setFormData({ ...formData, [name]: e.target.value })
              }
              className="w-full focus:outline-none text-sm text-gray-700"
              required/>
            {isPassword && (
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="ml-2 text-gray-500 hover:text-purple-500 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            )}
          </div>
        ))}

        <button type="submit" className={BUTTON_CLASSES} disabled={loading}>
          {loading ? "Signing up..." : (
            <>
              <UserPlus className="w-4 h-4 mr-2" />
              Sign Up
            </>
          )}
        </button>
      </form>

      <p className="text-center text-sm text-gray-600 mt-6">
        Already have an account?{" "}
        <button
          type="button"
          className="text-purple-600 hover:text-purple-700 hover:underline font-medium transition-colors"
          onClick={handleSwitchMode}
        >
          Login
        </button>
      </p>
    </div>
  );
};

export default SignUp;
