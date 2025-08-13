import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./Firebase";
import { useState, useEffect } from "react";
import BrandPeekLogin from "./pages/AdminLogin";
import DashboardHome from "./pages/DashboardHome";
import AdminLayout from "./layouts/AdminLayout";
import AddBrand from "./pages/AddBrand";
import ViewBrands from "./pages/ViewBrands";
import Ranking from "./pages/ranking"

function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []); 

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={user ? <Navigate to="/dashboard" replace /> : <BrandPeekLogin />} 
        />
        
        {/* Protected routes */}
        <Route 
          path="/" 
          element={user ? <AdminLayout /> : <Navigate to="/login" replace />}
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardHome />} />
          <Route path="add-brand" element={<AddBrand />} />
          <Route path="view-brands" element={<ViewBrands />} />
          <Route path="rankings" element={<Ranking />} />
          
          {/* Catch-all route */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;