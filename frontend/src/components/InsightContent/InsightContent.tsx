import React, { useState, useEffect } from 'react';
import { Select, Box, Stack, Paper, SegmentedControl, Title, Grid, TextInput, Button, Checkbox, Alert } from '@mantine/core';
import { IconMap, IconChartBar, IconTable } from '@tabler/icons-react';

import Map from '../Map/Map';
import DataTable from '../DataTable/DataTable';
import Visualization from '../Visualization/Visualization';
import { fetchData } from '../../services/api';

interface InsightContentProps {
    selectedSeries: string;
    selectedSector: string;
}

const InsightContent: React.FC<InsightContentProps> = ({ selectedSeries, selectedSector }) => {
    const [activeTab, setActiveTab] = useState("map");
    const [data, setData] = useState<any[]>([]);
    const [filteredData, setFilteredData] = useState<any[]>([]);
    const [filters, setFilters] = useState<any>({});
    const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({
        series_name: selectedSeries,
        sector: selectedSector,
    });

    useEffect(() => {
        const fetchTabData = async () => {
            if (!selectedSeries) {
                return;
            }
            try {
                const result = await fetchData(selectedSector || selectedFilters.sector, selectedSeries || selectedFilters.series_name);
                setData(result.data || []);
                setFilters(result.filters || {});

            setSelectedFilters(prev => {
                const updatedFilters: Record<string, string> = {};
                Object.keys({ ...prev, ...result.filters }).forEach(key => {
                    if (result.filters[key] && result.filters[key].length > 0) {
                        const availableOptions = result.filters[key].map(String);
                        updatedFilters[key] = prev[key] && availableOptions.includes(prev[key])
                            ? prev[key]
                            : String(result.filters[key][0]);
                    }
                });
                console.log("Selected Filters: ", updatedFilters);
                return updatedFilters;
            });
            setFilteredData(applyFilters(data, selectedFilters));

            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchTabData();
    }, [selectedSeries]);

    useEffect(() => {
        if (data.length > 0) {
            const filtered = applyFilters(data, selectedFilters);
            setFilteredData(filtered);
            console.log(">> Filtered Data: ", filteredData)
        }
    }, [selectedFilters, data]);

    const applyFilters = (rawData: any[], currentFilters: Record<string, string>) => {
        return rawData.filter(item =>
            Object.entries(currentFilters).every(([key, value]) => {
                if (key === 'year') return true;
                if (!item[key]) return true;
                return String(item[key]) === value;
            })
        );
    };

    return (
        <Stack p="lg">
            {data.length > 0 ? (
                <Box>
                    <Title order={1}>{selectedSeries}</Title>
                    <Grid>
                        {/* Filter Panel */}
                        <Grid.Col span={{ base: 12, sm: 3 }}>
                            <Paper p="md" shadow="sm" withBorder>
                                {Object.keys(filters).map((key) => (
                                    filters[key] && filters[key].length > 0 && (  
                                        <Select
                                            key={key}
                                            label={key}
                                            data={filters[key].map((item: any) => ({
                                                label: item,
                                                value: String(item),
                                            }))}
                                            value={selectedFilters[key] || filters[key]?.[0] || ''}
                                            onChange={(value) => setSelectedFilters(prev => ({ ...prev, [key]: value as string }))} 
                                            styles={{
                                                dropdown: {
                                                    maxHeight: '200px',
                                                    overflowY: 'auto',
                                                },
                                                root: {
                                                    marginBottom: '16px',
                                                },
                                            }}
                                        />
                                    )
                                ))}
                            </Paper>
                        </Grid.Col>
                        
                        {/* Main Content */}
                        <Grid.Col span={{ base: 12, sm: 9 }}>
                            <Paper p="md" shadow="sm" withBorder>
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
                                
                                {activeTab === 'map' && <Map data={filteredData} width="100%" height="500px" />}
                                {activeTab === 'visualization' && <Visualization data={filteredData} width="100%" height="500px" />}
                                {activeTab === 'data' && <DataTable data={filteredData} width="100%" height="500px" />}
                            </Paper>
                        </Grid.Col>
                    </Grid>
                </Box>
                
            ) : (
                <Box>
                    <Alert title="Dataset Not Found!" color="blue" variant="light" style={{ margin: '20px' }}>
                        Please select a series to explore data visualizations and tables.
                    </Alert>
                </Box>
            )}
        </Stack>
    );
};

export default InsightContent;
