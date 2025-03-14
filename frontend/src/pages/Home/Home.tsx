// src/pages/Home.tsx
import React from 'react';
import { Stack } from '@mantine/core'; 
import { HeroSection } from '../../components/HeroSection/HeroSection';
import { MissionSection } from '../../components/MissionSection/MissionSection';

const Home: React.FC = () => {
  return (
    <Stack>
      <HeroSection />
      <MissionSection />
    </Stack>
  );
};

export default Home;
