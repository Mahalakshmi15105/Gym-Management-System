/**
 * Mobile Navigation Component for Super Admin
 * Provides touch-friendly navigation for mobile devices
 */

import React, { useState } from 'react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const MobileNavigation = ({ menuItems }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  if (user?.role !== 'super_admin') return null;

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-gray-200 px-4 py-3 flex justify-between items-center sticky top-0 z-40">
        <div className="flex items-center">
          <h1 className="text-lg font-semibold text-gray-800">Super Admin</h1>
        </div>
        <button
          onClick={toggleMenu}
          className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 touch-target"
        >
          {isMenuOpen ? (
            <XMarkIcon className="h-6 w-6" />
          ) : (
            <Bars3Icon className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={toggleMenu} />
          <div className="fixed top-0 left-0 w-80 h-full bg-white shadow-xl">
            {/* Menu Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">Menu</h2>
              <button
                onClick={toggleMenu}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 touch-target"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Navigation Links */}
            <nav className="p-4">
              <ul className="space-y-2">
                {menuItems?.map((item) => (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      onClick={toggleMenu}
                      className={`flex items-center p-3 rounded-lg text-sm font-medium transition-colors touch-target ${
                        location.pathname === item.path
                          ? 'bg-orange-100 text-orange-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {item.icon && (
                        <item.icon className="h-5 w-5 mr-3 flex-shrink-0" />
                      )}
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileNavigation;