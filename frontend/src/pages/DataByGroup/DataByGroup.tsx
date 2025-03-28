import React, { useState, useEffect } from 'react';
import { Grid, Select, Accordion, AccordionItem, AccordionControl, AccordionPanel, Group, Text, Paper, SegmentedControl } from '@mantine/core';
import { IconMap, IconChartBar, IconTable } from '@tabler/icons-react';
import { fetchData } from '../../services/api';

import Map from '../../components/Map/Map';
import DataTable from '../../components/DataTable/DataTable';
import Visualization from '../../components/Visualization/Visualization';

const DataByGroup: React.FC = () => {
    const filterLabels: Record<string, string> = {
        sector: 'Sector',
        subsector_1: 'Sub-sector (1)',
        subsector_2: 'Sub-sector (2)',
        indicator: 'Indicator',
        province: 'Province',
        year: 'Year',
        markets: 'Markets',
        products: 'Products',
        grade: 'Grade',
        variety: 'Variety'
    };
    const [activeTab, setActiveTab] = useState("map");
    const [data, setData] = useState<any[]>([]);
    const [filteredData, setFilteredData] = useState<any[]>([]);
    const [filters, setFilters] = useState<any>({});
    const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({
        sector: "Agriculture",
        subsector_1: "Production",
        subsector_2: "Rice",
    });
    const fetchTabData = async (currentFilters: Record<string, string>) => {
        try {
            const result = await fetchData(
                currentFilters.sector,
                currentFilters.subsector_1,
                currentFilters.subsector_2
            );
            setData(result.data);
            setFilteredData(result.data);
            setFilters(result.filters);

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
                return updatedFilters;
            });
            console.log(selectedFilters)
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const handleTabChange = (value: string) => {
        setActiveTab(value);
    };

    const handleFilterChange = (filterKey: string, value: string) => {
        setSelectedFilters(prev => {
            const newFilters = { ...prev, [filterKey]: value };
            if (['sector', 'subsector_1', 'subsector_2'].includes(filterKey)) {
                fetchTabData(newFilters);
            }
            else {
                setFilteredData(data.filter((item: any) => item[filterKey] === value));
            }
            return newFilters;
        });
    };

    const priorityFilters = ['sector', 'subsector_1', 'subsector_2', 'indicator'];
    const allFilterKeys = Object.keys(filters).filter(key => key !== 'series_name'); // Explicitly exclude series_name
    const orderedFilterKeys = [
        ...priorityFilters.filter(key => allFilterKeys.includes(key)),
        ...allFilterKeys.filter(key => !priorityFilters.includes(key))
    ];

    useEffect(() => {
        fetchTabData(selectedFilters);
    }, []);

    return (
        <Grid p={10}>
            <Grid.Col span={{ base: 12, sm: 3 }}>
                <Paper p="md" radius="md" shadow="xs" withBorder>
                    {orderedFilterKeys.map((key) => (
                        filters[key] && filters[key].length > 0 && (  
                            <Select
                                key={key}
                                label={filterLabels[key] || key}
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
                        )
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

                    {activeTab === 'map' && <Map data={filteredData} width="100%" height="500px" />}
                    {activeTab === 'visualization' && <Visualization data={filteredData} width="100%" height="500px" />}
                    {activeTab === 'data' && <DataTable data={filteredData} width="100%" height="500px" />}
                </Paper>
            </Grid.Col>
        </Grid>
    );
};

export default DataByGroup;