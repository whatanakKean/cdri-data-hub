import React, { useState, useEffect } from 'react';
import { Stack } from '@mantine/core';
import { fetchMenu } from '../../services/api';
import { DataExplorerHeroSection } from '../../components/HeroSection/DataExplorerHeroSection';
import InsightContent from '../../components/InsightContent/InsightContent';

interface MenuItem {
    series_name: string;
    sector: string;
}

const DataExplorer: React.FC = () => {
    const [menu, setMenu] = useState<MenuItem[]>([]);
    const [selectedSeries, setSelectedSeries] = useState<string>('');
    const [selectedSector, setSelectedSector] = useState<string>('');

    const fetchMenuData = async () => {
        try {
            const result = await fetchMenu();
            setMenu(result.data_explorer);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    useEffect(() => {
        fetchMenuData();
        
    }, []);

    const handleSeriesSelect = (series: string) => {
        setSelectedSeries(series);
        const sector = menu.find(item => item.series_name === series)?.sector || '';
        setSelectedSector(sector);
      };

    return (
        <Stack gap={0}>
            <DataExplorerHeroSection
                title="Data Explorer"
                subtitle="Empowering Evidence-Based Decision-Making"
                menuData={menu.map(item => item.series_name)}
                onSelectSeries={handleSeriesSelect}
            />
            <InsightContent selectedSeries={selectedSeries} selectedSector={selectedSector} /> 
        </Stack>
    );
};

export default DataExplorer;
