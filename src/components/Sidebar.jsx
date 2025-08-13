import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Settings, 
  Tag,
  ChevronDown,
  PlusSquare,
  List,
  Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminSidebar = ({ isOpen }) => {
  const [expandedItems, setExpandedItems] = useState({});

  const navItems = [
    {
      key: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      path: '/dashboard'
    },
    {
      key: 'brands',
      label: 'Brands',
      icon: Tag,
      subItems: [
        { label: 'Add Brand', path: '/add-brand', icon: PlusSquare },
        { label: 'View Brands', path: '/view-brands', icon: List }
      ]
    },
    {
      key: 'rankings',
      label: 'Rankings',
      icon: Award,
      path: '/rankings'
    },
    {
      key: 'settings',
      label: 'Settings',
      icon: Settings,
      path: '/settings'
    }
  ];

  const toggleItem = (key) => {
    setExpandedItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <motion.aside
      initial={{ width: isOpen ? 240 : 64 }}
      animate={{ width: isOpen ? 240 : 64 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={`fixed h-full bg-gray-800 border-r border-gray-700 overflow-hidden flex flex-col z-20`}
    >
      <nav className="flex-1 overflow-y-auto py-2">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => (
            <li key={item.key}>
              {item.path && !item.subItems ? (
                <NavLink
                  to={item.path}
                  className={({ isActive }) => 
                    `flex items-center p-3 rounded-lg transition-colors duration-200 ${
                      isActive 
                        ? 'bg-blue-900/50 text-blue-300 border-l-4 border-blue-400' 
                        : 'text-gray-300 hover:bg-gray-700'
                    }`
                  }
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {isOpen && <span className="ml-3">{item.label}</span>}
                </NavLink>
              ) : (
                <>
                  <button
                    onClick={() => toggleItem(item.key)}
                    className={`flex items-center w-full p-3 rounded-lg transition-colors duration-200 ${
                      expandedItems[item.key] 
                        ? 'bg-gray-700 text-white' 
                        : 'text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    {isOpen && (
                      <>
                        <span className="ml-3 flex-1 text-left">{item.label}</span>
                        <motion.span
                          animate={{ rotate: expandedItems[item.key] ? 90 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown className="w-4 h-4" />
                        </motion.span>
                      </>
                    )}
                  </button>

                  <AnimatePresence>
                    {isOpen && expandedItems[item.key] && item.subItems && (
                      <motion.ul
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden ml-2 pl-6 border-l border-gray-700"
                      >
                        {item.subItems.map((subItem) => (
                          <li key={subItem.path}>
                            <NavLink
                              to={subItem.path}
                              className={({ isActive }) => 
                                `flex items-center p-2 rounded-lg text-sm transition-colors duration-200 ${
                                  isActive 
                                    ? 'text-blue-300' 
                                    : 'text-gray-400 hover:text-gray-200'
                                }`
                              }
                            >
                              {subItem.icon && (
                                <subItem.icon className="w-4 h-4 mr-2 flex-shrink-0" />
                              )}
                              {subItem.label}
                            </NavLink>
                          </li>
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {isOpen && (
        <div className="p-2 border-t border-gray-700 text-center text-xs text-gray-400">
          BrandPeek Admin v1.0
        </div>
      )}
    </motion.aside>
  );
};

export default AdminSidebar;