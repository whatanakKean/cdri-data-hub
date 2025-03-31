import React, { useRef, useState, useEffect } from 'react';
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
        indicator: "Area Planted",
        province: "Tboung Khmum"
    });
    const prevSelectedFiltersRef = useRef(selectedFilters);

    const fetchTabData = async (currentFilters: Record<string, string>) => {
        try {
            const result = await fetchData(
                currentFilters.sector,
                currentFilters.subsector_1,
                currentFilters.subsector_2
            );

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
                return updatedFilters;
            });

            const updatedFilteredData = applyFilters(data, selectedFilters);
            setFilteredData(updatedFilteredData);

        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const applyFilters = (rawData: any[], currentFilters: Record<string, string>) => {
        return rawData.filter(item =>
            Object.entries(currentFilters).every(([key, value]) => {
                if (key === 'year') return true;
                if (!item[key]) return true;
                return String(item[key]) === value;
            })
        );
    };

    useEffect(() => {
        const updatedFilteredData = applyFilters(data, selectedFilters);
        setFilteredData(updatedFilteredData);
    }, [selectedFilters]);

    useEffect(() => {
        // Check if any of sector, subsector_1, or subsector_2 have changed
        const hasCriticalFilterChanged =
            selectedFilters.sector !== prevSelectedFiltersRef.current.sector ||
            selectedFilters.subsector_1 !== prevSelectedFiltersRef.current.subsector_1 ||
            selectedFilters.subsector_2 !== prevSelectedFiltersRef.current.subsector_2;

        // If critical filters change, fetch new data
        if (hasCriticalFilterChanged) {
            fetchTabData(selectedFilters);
        } else {
            const updatedFilteredData = applyFilters(data, selectedFilters);
            setFilteredData(updatedFilteredData);
        }

        // Update the previous filters after processing
        prevSelectedFiltersRef.current = selectedFilters;

    }, [selectedFilters]);

    useEffect(() => {
        fetchTabData(selectedFilters);
    }, []);

    return (
        <Grid p={10}>
            <Grid.Col span={{ base: 12, sm: 3 }}>
                <Paper p="md" radius="md" shadow="xs" withBorder>
                    {Object.keys(filters).map((key) => (
                        filters[key] && filters[key].length > 0 && (  
                            <Select
                                key={key}
                                label={filterLabels[key] || key}
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
    );
};

export default DataByGroup;
