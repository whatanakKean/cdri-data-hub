import React, { useRef, useState, useEffect } from 'react';
import { Stack, Grid, Select, Accordion, AccordionItem, AccordionControl, AccordionPanel, Group, Text, Paper, SegmentedControl } from '@mantine/core';
import { IconMap, IconChartBar, IconTable } from '@tabler/icons-react';
import { fetchData } from '../../services/api';
import { HeroSection } from '../../components/HeroSection/HeroSection';

import Map from '../../components/Map/Map';
import DataTable from '../../components/DataTable/DataTable';
import Visualization from '../../components/Visualization/Visualization';

const DataBySeries: React.FC = () => {
    const [activeTab, setActiveTab] = useState("map");
    const [data, setData] = useState<any[]>([]); 
    const [filteredData, setFilteredData] = useState<any[]>([]);
    const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({
        series_name: "Rice Production",
        sector: "Agriculture",
        subsector_1: "Production",
        subsector_2: "Rice",
        indicator: "Area Planted",
        province: "Tboung Khmum"
    });

    const fetchTabData = async () => {
        try {
            const result = await fetchData(
                selectedFilters.sector,
                selectedFilters.subsector_1,
                selectedFilters.subsector_2
            );

            setData(result.data || []);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };
    useEffect(() => {
        fetchTabData();
    }, []);

  return (
    <Stack>
      <HeroSection title={selectedFilters.series_name} subtitle="" />
      <Paper p="md" radius="md" shadow="xs" withBorder>
            <SegmentedControl
                fullWidth
                value={activeTab}
                onChange={setActiveTab}
                data={[
                    { label: <><IconMap size={12} /> Map</>, value: 'map' },
                    { label: <><IconChartBar size={12} /> Visualization</>, value: 'visualization' },
                    { label: <><IconTable size={12} /> Data View</>, value: 'data' },
                ]}
            />

            {activeTab === 'map' && <Map data={data} width="100%" height="500px" />}
            {activeTab === 'visualization' && <Visualization data={data} width="100%" height="500px" />}
            {activeTab === 'data' && <DataTable data={data} width="100%" height="500px" />}
        </Paper>
    </Stack>
  );
};

export default DataBySeries;
