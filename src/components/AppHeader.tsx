
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, MapPin, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AppHeaderProps {
  onToggleSidebar?: () => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({ onToggleSidebar }) => {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <header className="bg-white border-b">
      <div className="container px-4 h-16 flex items-center justify-between">
        <div className="flex items-center">
          <button 
            onClick={onToggleSidebar}
            className="lg:hidden mr-4 p-2 rounded-md hover:bg-gray-100 transition-colors"
            aria-label="Toggle sidebar"
          >
            <Menu size={22} />
          </button>
          
          <Link to="/" className="flex items-center">
            <MapPin className="text-blue-500 mr-2" />
            <span className="font-semibold text-lg">TableView</span>
          </Link>
        </div>
        
        <nav className="hidden md:flex">
          <Link 
            to="/" 
            className={cn(
              "flex items-center px-4 py-2 mx-1 rounded-md text-sm font-medium transition-colors",
              isActive('/') ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-50"
            )}
          >
            <MapPin size={18} className="mr-1.5" />
            <span>Tables</span>
          </Link>
          
          <Link 
            to="/orders" 
            className={cn(
              "flex items-center px-4 py-2 mx-1 rounded-md text-sm font-medium transition-colors",
              isActive('/orders') ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-50"
            )}
          >
            <LayoutDashboard size={18} className="mr-1.5" />
            <span>Orders</span>
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default AppHeader;
