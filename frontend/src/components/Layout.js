import React from 'react';
import Navigation from './Navigation';
import Footer from './Footer';

function Layout({ children }) {
  return (
    <div className="app-clay">
      <Navigation />
      <main>{children}</main>
      <Footer />
    </div>
  );
}

export default Layout;
