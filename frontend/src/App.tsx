import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import '@mantine/core/styles.css';
import { MantineProvider } from '@mantine/core';
import Home from './pages/Home/Home';
import { HeaderMenu } from './components/Header/HeaderMenu';
import { FooterMenu } from './components/Footer/FooterMenu';
import { NotFound } from './components/NotFound/NotFound';
import DataByGroup from './pages/DataByGroup/DataByGroup';
import { IconArrowUp } from '@tabler/icons-react';
import { ActionIcon, Affix } from '@mantine/core';

const App: React.FC = () => {
  // Function to scroll to top
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <MantineProvider>
      <Router>
        <HeaderMenu />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/data" element={<DataByGroup />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <FooterMenu />
        
        <Affix position={{ bottom: 20, right: 20 }}>
          <ActionIcon color="blue" radius="xl" size={50} onClick={scrollToTop}>
            <IconArrowUp stroke={1.5} size={30} />
          </ActionIcon>
        </Affix>
      </Router>
    </MantineProvider>
  );
};

export default App;
