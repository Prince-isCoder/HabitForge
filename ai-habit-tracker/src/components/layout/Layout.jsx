import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';

const Layout = () => {
  return (
    <div style={{
      display: "flex",
      height: "100vh",
      overflow: "hidden",
      background: "var(--background)",
      fontFamily: "'Outfit', sans-serif",
      transition: "background 0.2s",
    }}>

      {/* Sidebar */}
      <Sidebar />

      {/* Main area */}
      <div style={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        overflow: "hidden",
        position: "relative",
      }}>

        {/* Top Navbar */}
        <TopNavbar />

        {/* Page content */}
        <main style={{
          flex: 1,
          overflowY: "auto",
          background: "var(--background)",
          position: "relative",
          zIndex: 0,
          scrollbarWidth: "thin",
          scrollbarColor: "var(--primary) transparent",
          transition: "background 0.2s",
        }}>
          <Outlet />
        </main>

      </div>
    </div>
  );
};

export default Layout;