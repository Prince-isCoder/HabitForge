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
      background: "#0a0c12",
      fontFamily: "'Outfit', sans-serif",
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
          background: "#0a0c12",
          position: "relative",
          zIndex: 0,
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(99,102,241,0.2) transparent",
        }}>
          <Outlet />
        </main>

      </div>
    </div>
  );
};

export default Layout;