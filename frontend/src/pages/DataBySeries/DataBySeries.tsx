import React, { useRef, useState, useEffect } from 'react';
import { Stack, Grid, Select, Accordion, AccordionItem, AccordionControl, AccordionPanel, Group, Text, Paper, SegmentedControl } from '@mantine/core';
import { IconMap, IconChartBar, IconTable } from '@tabler/icons-react';
import { fetchData } from '../../services/api';
import { HeroSection } from '../../components/HeroSection/HeroSection';

import Map from '../../components/Map/Map';
import DataTable from '../../components/DataTable/DataTable';
import Visualization from '../../components/Visualization/Visualization';
import InsightConent from '../../components/InsightContent/InsightContent';

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
                selectedFilters.series_name
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
      {/* <InsightConent/> */}
    </Stack>
  );
};

export default DataBySeries;
