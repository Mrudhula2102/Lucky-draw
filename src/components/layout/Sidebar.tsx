import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Trophy,
  Users,
  Sparkles,
  Award,
  MessageSquare,
  BarChart3,
  Settings,
  UserCog,
} from 'lucide-react';

interface NavItem {
  path: string;
  icon: React.ReactNode;
  label: string;
}

const navItems: NavItem[] = [
  { path: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard' },
  { path: '/contests', icon: <Trophy className="w-5 h-5" />, label: 'Contests' },
  { path: '/participants', icon: <Users className="w-5 h-5" />, label: 'Participants' },
  { path: '/draw', icon: <Sparkles className="w-5 h-5" />, label: 'Lucky Draw' },
  { path: '/winners', icon: <Award className="w-5 h-5" />, label: 'Winners' },
  { path: '/communication', icon: <MessageSquare className="w-5 h-5" />, label: 'Communication' },
  { path: '/analytics', icon: <BarChart3 className="w-5 h-5" />, label: 'Analytics' },
  { path: '/admin-management', icon: <UserCog className="w-5 h-5" />, label: 'User Management' },
  { path: '/settings', icon: <Settings className="w-5 h-5" />, label: 'Settings' },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-screen sticky top-0 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Lucky Draw</h1>
            <p className="text-xs text-gray-500">Admin Panel</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`
                }
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg p-4 text-white">
          <h3 className="font-semibold mb-1">Need Help?</h3>
          <p className="text-xs text-primary-100 mb-3">
            Check our documentation for guides and tutorials
          </p>
          <button className="w-full bg-white text-primary-700 text-sm font-medium py-2 rounded-lg hover:bg-primary-50 transition-colors">
            View Docs
          </button>
        </div>
      </div>
    </aside>
  );
};
