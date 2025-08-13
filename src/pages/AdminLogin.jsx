import { useState, useEffect } from "react";
import { Eye, EyeOff, Mail, Lock, ArrowRight, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { auth } from "../Firebase";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";

export default function BrandPeekLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate("/dashboard");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Redirect happens automatically from onAuthStateChanged
    } catch (err) {
      setIsLoading(false);
      switch (err.code) {
        case "auth/invalid-email":
          setError("Invalid email address");
          break;
        case "auth/user-disabled":
          setError("Account disabled");
          break;
        case "auth/user-not-found":
          setError("No account found with this email");
          break;
        case "auth/wrong-password":
          setError("Incorrect password");
          break;
        case "auth/too-many-requests":
          setError("Too many attempts. Try again later");
          break;
        default:
          setError("Login failed. Please try again");
          console.error("Login error:", err);
      }
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 text-white">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-48 -left-48 w-96 h-96 bg-gradient-to-tr from-blue-500 to-indigo-700 rounded-full mix-blend-screen filter blur-3xl opacity-70 animate-pulseSmooth"></div>
        <div className="absolute -bottom-48 -right-48 w-96 h-96 bg-gradient-to-br from-purple-600 to-indigo-500 rounded-full mix-blend-screen filter blur-3xl opacity-60 animate-pulseSmooth animation-delay-2000"></div>
        <div className="absolute top-32 left-1/2 w-96 h-96 bg-gradient-to-tl from-purple-700 via-blue-600 to-indigo-500 rounded-full mix-blend-screen filter blur-2xl opacity-50 animate-pulseSmooth animation-delay-4000"></div>

        {/* Floating particles */}
        <div className="absolute inset-0">
          {[...Array(50)].map((_, i) => (
            <span
              key={i}
              className="absolute rounded-full bg-blue-400 opacity-25 animate-pulseParticle"
              style={{
                width: "3px",
                height: "3px",
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 4}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-6 sm:p-12">
        <div className="w-full max-w-md bg-black bg-opacity-40 backdrop-blur-md rounded-3xl border border-gray-700 shadow-lg transform transition-transform duration-300 hover:scale-[1.04]">
          {/* Brand/Logo */}
          <div className="text-center mb-10 px-6 pt-8">
            <h1 className="text-5xl font-extrabold bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent select-none tracking-tight drop-shadow-md">
              BrandPeek
            </h1>
            <p className="mt-1 text-gray-300 text-sm font-medium uppercase tracking-widest">
              Admin Login
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-7 px-8 pb-10">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-200 text-sm">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Email */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-6 w-6 text-blue-400 group-focus-within:text-indigo-400" />
              </div>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
                className="w-full pl-14 pr-4 py-3 rounded-xl bg-black/30 border border-gray-600 placeholder-gray-400 text-white focus:outline-none focus:ring-3 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Password */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-6 w-6 text-blue-400 group-focus-within:text-indigo-400" />
              </div>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                className="w-full pl-14 pr-14 py-3 rounded-xl bg-black/30 border border-gray-600 placeholder-gray-400 text-white focus:outline-none focus:ring-3 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-blue-400 hover:text-indigo-400"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            {/* Forgot Password */}
            <div className="text-right">
              <button
                type="button"
                className="text-sm text-blue-400 hover:text-indigo-300"
                onClick={() => navigate("/reset-password")}
              >
                Forgot password?
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-indigo-600 hover:to-blue-700 font-semibold py-3 rounded-xl shadow-lg transition-transform duration-200 active:scale-95 disabled:opacity-60"
            >
              {isLoading ? (
                <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </form>

          <div className="text-center text-gray-400 text-xs pb-6 select-none">
            © 2025 BrandPeek. All rights reserved.
          </div>
        </div>
      </div>

      {/* Animations */}
      <style jsx>{`
        .animate-pulseSmooth {
          animation: pulseSmooth 6s ease-in-out infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s !important;
        }
        .animation-delay-4000 {
          animation-delay: 4s !important;
        }
        @keyframes pulseSmooth {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 0.85; transform: scale(1.07); }
        }
        .animate-pulseParticle {
          animation-name: pulseParticle;
          animation-iteration-count: infinite;
          animation-timing-function: ease-in-out;
          animation-direction: alternate;
        }
        @keyframes pulseParticle {
          0% { opacity: 0.15; transform: translateY(0) scale(1); }
          100% { opacity: 0.3; transform: translateY(-4px) scale(1.1); }
        }
      `}</style>
    </div>
  );
}
