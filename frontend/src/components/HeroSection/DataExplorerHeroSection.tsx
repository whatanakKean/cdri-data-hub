import { Autocomplete, Title, Text, Stack, Box } from '@mantine/core';
import classes from './DataExplorerHeroSection.module.css';

interface HeroSectionProps {
  title: string;
  subtitle: string;
  menuData: any;
  onSelectSeries: (value: string) => void; // New prop
}

export function DataExplorerHeroSection({ title, subtitle, menuData, onSelectSeries }: HeroSectionProps) {
  return (
    <Box className={classes.root}>
      <Stack>
        <Title order={1} className={classes.title}>CDRI Data Hub Explorer</Title>
        <Text size="xl" className={classes.description}>Explore Data and Visualizations with Natural Language</Text>
        <Autocomplete
          label="Select Data Series"
          placeholder="Ask Anything..."
          data={menuData}
          onChange={onSelectSeries} // Update selected value
        />
      </Stack>
    </Box>
  );
}
