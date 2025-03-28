import React, { useState, useEffect } from 'react';
import { Grid, Select, Accordion, AccordionItem, AccordionControl, AccordionPanel, Group, Text, Paper, SegmentedControl } from '@mantine/core';
import { IconMap, IconChartBar, IconTable } from '@tabler/icons-react';
import { fetchData } from '../../services/api';

import Map from '../../components/Map/Map';
import DataTable from '../../components/DataTable/DataTable';
import Visualization from '../../components/Visualization/Visualization';

const DataByGroup: React.FC = () => {
    const [activeTab, setActiveTab] = useState("map");
    const [data, setData] = useState<any[]>([]);
    const [filters, setFilters] = useState<any>({});
    const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({});

    // Fetch data for a specific tab with selected filters
    const fetchTabData = async () => {
        try {
            const result = await fetchData("Agriculture", "Rice Production");
            setData(result.data);
            setFilters(result.filters);
            
            // Initialize selected filters with first value of each filter if not already set
            const initialFilters: Record<string, string> = {};
            Object.keys(result.filters).forEach(key => {
                initialFilters[key] = String(result.filters[key][0]);
            });
            setSelectedFilters(prev => ({
                ...initialFilters,
                ...prev // Preserve any existing selections
            }));
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    // Effect to fetch data when the component mounts
    useEffect(() => {
        fetchTabData();
    }, []);

    // Handle segment change
    const handleTabChange = (value: string) => {
        setActiveTab(value);
        fetchTabData();
    };

    // Handle filter selection change
    const handleFilterChange = (filterKey: string, value: string) => {
        setSelectedFilters(prev => ({
            ...prev,
            [filterKey]: value
        }));
        // Optionally fetch new data based on updated filters
        // fetchTabData(); 
    };

    return (
        <Grid p={10}>
            <Grid.Col span={{ base: 12, sm: 3 }}>
                <Paper p="md" radius="md" shadow="xs" withBorder>
                    {Object.keys(filters).map((key) => (
                        <Select
                            key={key}
                            label={key}
                            data={filters[key].map((item: any) => ({
                                label: item,
                                value: String(item),
                            }))}
                            value={selectedFilters[key] || filters[key]?.[0] || ''}
                            onChange={(value) => handleFilterChange(key, value as string)}
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
                    ))}

                    <Accordion variant="contained" radius="md">
                        <AccordionItem value="metadata">
                            <AccordionControl>
                                <Group>
                                    <div>
                                        <Text>Metadata</Text>
                                        <Text size="sm" color="dimmed">Information about the current data</Text>
                                    </div>
                                </Group>
                            </AccordionControl>
                            <AccordionPanel>
                                <Text size="sm">This is a placeholder for metadata information.</Text>
                            </AccordionPanel>
                        </AccordionItem>
                    </Accordion>
                </Paper>
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 9 }}>
                <Paper p="md" radius="md" shadow="xs" withBorder>
                    <SegmentedControl
                        fullWidth
                        value={activeTab}
                        onChange={handleTabChange}
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
            </Grid.Col>
        </Grid>
    );
};

export default DataByGroup;