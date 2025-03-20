import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import AppHeader from '@/components/AppHeader';
import { SidebarProvider, Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { LayoutDashboard, MapPin, Settings, ChefHat, Users, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;

  return (
    <SidebarProvider>
      <div className="min-h-screen w-full flex flex-col overflow-hidden">
        <AppHeader onToggleSidebar={() => setIsOpen(!isOpen)} />
        
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <Sidebar className="hidden lg:block">
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel>Main</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <a 
                          href="/" 
                          className={cn(
                            isActive('/') ? "bg-sidebar-accent text-sidebar-accent-foreground" : ""
                          )}
                        >
                          <MapPin size={18} />
                          <span>Restaurant Map</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <a 
                          href="/orders" 
                          className={cn(
                            isActive('/orders') ? "bg-sidebar-accent text-sidebar-accent-foreground" : ""
                          )}
                        >
                          <LayoutDashboard size={18} />
                          <span>Orders</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
              
              <SidebarGroup>
                <SidebarGroupLabel>Management</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <a href="#">
                          <ChefHat size={18} />
                          <span>Kitchen View</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <a href="#">
                          <Users size={18} />
                          <span>Staff Management</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <a href="#">
                          <Settings size={18} />
                          <span>Settings</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
              
              <SidebarGroup className="mt-auto">
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <a href="#">
                          <HelpCircle size={18} />
                          <span>Help & Support</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>
          
          {/* Mobile sidebar overlay */}
          {isOpen && (
            <div 
              className="lg:hidden fixed inset-0 bg-black/20 z-40"
              onClick={() => setIsOpen(false)}
            />
          )}
          
          {/* Mobile sidebar */}
          <div 
            className={cn(
              "lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out",
              isOpen ? "translate-x-0" : "-translate-x-full"
            )}
          >
            <div className="p-4 h-16 border-b flex items-center">
              <MapPin className="text-blue-500 mr-2" />
              <span className="font-semibold text-lg">TableView</span>
            </div>
            
            <div className="p-2">
              <div className="space-y-1">
                <a 
                  href="/" 
                  className={cn(
                    "flex items-center px-3 py-2 rounded-md",
                    isActive('/') ? "bg-blue-50 text-blue-700" : "hover:bg-gray-50"
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  <MapPin size={18} className="mr-2" />
                  <span>Restaurant Map</span>
                </a>
                
                <a 
                  href="/orders" 
                  className={cn(
                    "flex items-center px-3 py-2 rounded-md",
                    isActive('/orders') ? "bg-blue-50 text-blue-700" : "hover:bg-gray-50"
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  <LayoutDashboard size={18} className="mr-2" />
                  <span>Orders</span>
                </a>
                
                <div className="my-2 border-t" />
                
                <a 
                  href="#" 
                  className="flex items-center px-3 py-2 rounded-md hover:bg-gray-50"
                  onClick={() => setIsOpen(false)}
                >
                  <ChefHat size={18} className="mr-2" />
                  <span>Kitchen View</span>
                </a>
                
                <a 
                  href="#" 
                  className="flex items-center px-3 py-2 rounded-md hover:bg-gray-50"
                  onClick={() => setIsOpen(false)}
                >
                  <Users size={18} className="mr-2" />
                  <span>Staff Management</span>
                </a>
                
                <a 
                  href="#" 
                  className="flex items-center px-3 py-2 rounded-md hover:bg-gray-50"
                  onClick={() => setIsOpen(false)}
                >
                  <Settings size={18} className="mr-2" />
                  <span>Settings</span>
                </a>
              </div>
            </div>
          </div>
          
          {/* Main content */}
          <main className="flex-1 overflow-hidden bg-gray-50 flex flex-col">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default MainLayout;
