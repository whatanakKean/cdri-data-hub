import { Select, Title, Text, Stack, Box } from '@mantine/core';
import classes from './DataExplorerHeroSection.module.css';

interface HeroSectionProps {
  title: string;
  subtitle: string;
  menuData: any;
  onSelectSeries: (value: string) => void;
}

export function DataExplorerHeroSection({ title, subtitle, menuData, onSelectSeries }: HeroSectionProps) {
  return (
    <Box className={classes.root}>
      <Stack>
        <Title order={1} className={classes.title}>CDRI Data Hub Explorer</Title>
        <Text size="xl" className={classes.description}>Explore Data and Visualizations with Natural Language</Text>
        <Select
          placeholder="Ask Anything..."
          data={menuData}
          onChange={(value) => {
            if (value !== null) {
              onSelectSeries(value);
            }
            else{
              onSelectSeries('');
            }
          }}
          searchable
          clearable
        />
      </Stack>
    </Box>
  );
}
