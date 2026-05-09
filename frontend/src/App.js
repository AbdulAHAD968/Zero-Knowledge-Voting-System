import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import About from './pages/About';
import Careers from './pages/Careers';
import Contact from './pages/Contact';
import Community from './pages/Community';
import Documentation from './pages/Documentation';
import APIReference from './pages/APIReference';
import Whitepaper from './pages/Whitepaper';
import Election from './pages/Election';
import Technology from './pages/Technology';
import Security from './pages/Security';
import MerkleExplorer from './pages/MerkleExplorer';
import './Components.css';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/careers" element={<Careers />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/documentation" element={<Documentation />} />
        <Route path="/api-reference" element={<APIReference />} />
        <Route path="/whitepaper" element={<Whitepaper />} />
        <Route path="/election" element={<Election />} />
        <Route path="/technology" element={<Technology />} />
        <Route path="/security" element={<Security />} />
        <Route path="/explorer" element={<MerkleExplorer />} />
        
        {/* Explicit community routes */}
        <Route path="/twitter" element={<Community />} />
        <Route path="/github" element={<Community />} />
        <Route path="/discord" element={<Community />} />
        
        {/* Fallback for other community platforms */}
        <Route path="/community/:platform" element={<Community />} />
      </Routes>
    </Layout>
  );
}

export default App;
