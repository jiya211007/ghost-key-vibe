import React from 'react';
import { Outlet } from 'react-router-dom';
import Navigation from './Navigation.jsx';
import Footer from './Footer.jsx';

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Navigation />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
