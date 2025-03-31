import React from 'react';
import { Stack } from '@mantine/core';
import { DataExplorerHeroSection } from '../../components/HeroSection/DataExplorerHeroSection';


const DataExplorer: React.FC = () => {
  return (
    <Stack>
      <DataExplorerHeroSection title="Data Explorer" subtitle="Empowering Evidence-Based Decision-Making" />
    </Stack>
  );
};

export default DataExplorer;
