// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import '@mantine/core/styles.css';
import { MantineProvider } from '@mantine/core';
import Home from './pages/Home/Home';
import { HeaderMenu } from './components/Header/HeaderMenu';

import { FooterMenu } from './components/Footer/FooterMenu';
import { NotFound } from './components/NotFound/NotFound';
import DataByGroup from './pages/DataByGroup/DataByGroup';


const App: React.FC = () => {
  return (
    <MantineProvider>
      <Router>
      <HeaderMenu />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/testing" element={<DataByGroup />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      <FooterMenu />
      </Router>
    </MantineProvider>
  );
};

export default App;
