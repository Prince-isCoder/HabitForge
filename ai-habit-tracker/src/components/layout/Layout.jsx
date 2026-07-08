import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';

const Layout = () => {
  return (
    <div className="flex h-screen overflow-hidden bg-background font-['Outfit',_sans-serif] transition-colors duration-200">

      {/* Sidebar */}
      <Sidebar />

      {/* Main area */}
      <div className="flex flex-col flex-1 overflow-hidden relative">

        {/* Top Navbar */}
        <TopNavbar />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-background relative z-0 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
          <Outlet />
        </main>

      </div>
    </div>
  );
};

export default Layout;