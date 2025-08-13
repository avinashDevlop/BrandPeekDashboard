import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../Firebase';
import { useNavigate } from 'react-router-dom';
import AdminHeader from '../components/Header';
import AdminSidebar from '../components/Sidebar';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 text-white">
      {/* Header - Fixed */}
      <AdminHeader
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onLogout={handleLogout}
        isSidebarOpen={sidebarOpen}
      />

      {/* Content Wrapper */}
      <div className="flex flex-1 pt-16">
        {/* Sidebar */}
        <AdminSidebar isOpen={sidebarOpen} />

        {/* Main Content */}
        <main
          className={`flex-1 overflow-y-auto transition-all duration-300 px-6 py-6
            ${sidebarOpen ? 'ml-0 md:ml-64' : 'ml-0 md:ml-20'}
          `}
        >
          <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-lg p-6 min-h-[calc(100vh-8rem)] border border-white/10">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
