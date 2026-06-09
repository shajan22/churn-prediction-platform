import React from 'react';
import { User, LogOut } from 'lucide-react';

interface NavbarProps {
  user: { name: string; email: string; profilePhoto?: string } | null;
  onLoginClick: () => void;
  onLogout: () => void;
  onProfileClick?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLoginClick, onLogout, onProfileClick }) => {
  return (
    <div className="sticky top-0 z-50 w-full px-4 sm:px-6 lg:px-8 pt-4">
      <nav className="glass-card rounded-2xl mx-auto max-w-7xl transition-all duration-300">
        <div className="px-6">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3 cursor-pointer group">
              <div className="w-10 h-10 bg-gradient-to-tr from-indigo-500 to-violet-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 group-hover:scale-105 transition-transform duration-300">
                <span className="text-white font-bold text-sm tracking-wider">CP</span>
              </div>
              <span className="font-bold text-slate-800 text-lg tracking-tight">ChurnPredict<span className="text-indigo-500">.AI</span></span>
            </div>

            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-4">
                  <div
                    onClick={onProfileClick}
                    className="flex flex-row-reverse sm:flex-row items-center space-x-0 sm:space-x-3 gap-2 px-1 sm:px-3 py-1 sm:py-1.5 bg-slate-100/80 hover:bg-slate-200/80 rounded-full border border-slate-200/60 cursor-pointer transition-colors"
                  >
                    <div className="w-8 h-8 sm:w-7 sm:h-7 bg-indigo-100 rounded-full flex items-center justify-center overflow-hidden">
                      {user.profilePhoto ? (
                        <img src={user.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-4 h-4 text-indigo-600" />
                      )}
                    </div>
                    <span className="hidden sm:inline-block text-sm font-semibold text-slate-700 pr-2">{user.name}</span>
                  </div>
                  <button
                    onClick={onLogout}
                    className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200"
                    title="Logout"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={onLoginClick}
                  className="flex items-center space-x-2 px-6 py-2.5 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl shadow-lg shadow-slate-200 hover:shadow-indigo-200 transition-all duration-300 font-medium"
                >
                  <User className="w-4 h-4" />
                  <span>Sign In</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;