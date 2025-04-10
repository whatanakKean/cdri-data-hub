import React, { useState, useEffect, useMemo } from 'react';
import { Text, Divider, Select, MultiSelect, Box, Stack, Paper, SegmentedControl, Title, Grid, Alert } from '@mantine/core';
import { IconMap, IconChartBar, IconTable } from '@tabler/icons-react';

import Map from '../Map/Map';
import DataTable from '../DataTable/DataTable';
import Visualization from '../Visualization/Visualization';
import { fetchData } from '../../services/api';

import classes from './InsightContent.module.css';

interface InsightContentProps {
    selectedSeries: string;
    selectedSector: string;
}

const MULTI_SELECT_FIELDS = ['province', 'markets', 'occupation', 'products'];
const GIS_FIELDS = ['province', 'markets'];

const InsightContent: React.FC<InsightContentProps> = ({ selectedSeries, selectedSector }) => {
    const [activeTab, setActiveTab] = useState("map");
    const [data, setData] = useState<any[]>([]);
    const [filters, setFilters] = useState<any>({});
    const [selectedFilters, setSelectedFilters] = useState<Record<string, string | string[]>>({
        series_name: selectedSeries,
        sector: selectedSector,
    });
    const [hasGISFields, setHasGISFields] = useState(false);

    // Single useEffect to handle data fetching and initial filtering
    useEffect(() => {
        const fetchAndFilterData = async () => {
            if (!selectedSeries || selectedSeries === '') {
                setData([]);
                setFilters({});
                setHasGISFields(false);
                return;
            }
            try {
                const result = await fetchData(selectedSector, selectedSeries);
                const newData = result.data || [];
                setData(newData);
                setFilters(result.filters || {});

                // Check if data contains GIS fields
                const dataHasGIS = newData.some((item: any) =>
                    GIS_FIELDS.some(field => Object.keys(item).includes(field))
                );
                setHasGISFields(dataHasGIS);
                if (!dataHasGIS && activeTab === 'map') {
                    setActiveTab('visualization');
                }

                // Update selectedFilters based on fetched filters
                setSelectedFilters(prev => {
                    const updatedFilters: Record<string, string | string[]> = {
                        series_name: selectedSeries,
                        sector: selectedSector,
                    };
                    Object.keys(result.filters).forEach(key => {
                        if (result.filters[key] && result.filters[key].length > 0) {
                            const availableOptions = result.filters[key].map(String);
                            if (MULTI_SELECT_FIELDS.includes(key)) {
                                const prevValue = prev[key];
                                updatedFilters[key] = prevValue && Array.isArray(prevValue) && prevValue.every((v: string) => availableOptions.includes(v))
                                    ? prevValue
                                    : [String(result.filters[key][0])];
                            } else {
                                updatedFilters[key] = prev[key] && availableOptions.includes(prev[key] as string)
                                    ? prev[key] as string
                                    : String(result.filters[key][0]);
                            }
                        }
                    });
                    return updatedFilters;
                });
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchAndFilterData();
    }, [selectedSeries, selectedSector]); // Dependencies include both props

    // Memoize filtered data to avoid recalculating on every render
    const filteredData = useMemo(() => {
        return data.filter(item =>
            Object.entries(selectedFilters).every(([key, value]) => {
                if (key === 'year') return true;
                if (!item[key]) return true;
                if (Array.isArray(value)) {
                    return value.length === 0 || value.includes(String(item[key]));
                }
                return String(item[key]) === value;
            })
        );
    }, [data, selectedFilters]);

    // Memoize map data separately
    const mapData = useMemo(() => {
        return data.filter(item =>
            Object.entries(selectedFilters).every(([key, value]) => {
                if (key === 'year' || key === 'province' || key === 'markets') return true;
                if (!item[key]) return true;
                if (Array.isArray(value)) {
                    return value.length === 0 || value.includes(String(item[key]));
                }
                return String(item[key]) === value;
            })
        );
    }, [data, selectedFilters]);

    const handleSelectChange = (key: string, newValue: string | null) => {
        setSelectedFilters((prev) => {
            if (!newValue || newValue === prev[key]) {
                return prev;
            }
            return { ...prev, [key]: newValue };
        });
    };

    // Define tabs based on whether GIS fields are present
    const tabOptions = [
        ...(hasGISFields ? [{ label: <><IconMap size={12} /> Map</>, value: 'map' }] : []),
        { label: <><IconChartBar size={12} /> Visualization</>, value: 'visualization' },
        { label: <><IconTable size={12} /> Data View</>, value: 'data' },
    ];

    return (
        <Stack p="lg">
            {data.length > 0 && selectedSeries !== '' ? (
                <Box>
                    <Box>
                        <Grid align="center" justify="space-between">
                            <Grid.Col span="auto">
                                <Title order={3} className={classes.title}>
                                    {selectedSeries}
                                </Title>
                                <Text>{selectedSector}</Text>
                            </Grid.Col>
                            <Grid.Col span="content">
                                <SegmentedControl
                                    value={activeTab}
                                    onChange={setActiveTab}
                                    data={tabOptions}
                                />
                            </Grid.Col>
                        </Grid>
                    </Box>
                    <Divider my="sm" />
                    <Grid>
                        <Grid.Col span={{ base: 12, sm: 3 }}>
                            <Paper p="md" withBorder>
                                {Object.keys(filters).map((key) => {
                                    if (key !== 'year') {
                                        const filterOptions = filters[key].map((item: any) => ({
                                            label: item,
                                            value: String(item),
                                        }));

                                        if (MULTI_SELECT_FIELDS.includes(key)) {
                                            return (
                                                <MultiSelect
                                                    key={key}
                                                    label={key[0].toUpperCase() + key.slice(1)}
                                                    data={filterOptions}
                                                    value={(selectedFilters[key] as string[]) || [filterOptions[0]?.value]}
                                                    onChange={(value) =>
                                                        setSelectedFilters((prev) => ({ ...prev, [key]: value }))
                                                    }
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
                                            );
                                        } else {
                                            return (
                                                <Select
                                                    key={key}
                                                    label={key[0].toUpperCase() + key.slice(1)}
                                                    data={filterOptions}
                                                    value={(selectedFilters[key] as string) || filterOptions[0]?.value || ''}
                                                    onChange={(value) => handleSelectChange(key, value)}
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
                                            );
                                        }
                                    }
                                    return null;
                                })}
                            </Paper>
                        </Grid.Col>

                        <Grid.Col span={{ base: 12, sm: 9 }}>
                            <Paper p="md" withBorder>
                                {activeTab === 'map' && hasGISFields && <Map data={mapData} width="100%" height="450px" />}
                                {activeTab === 'visualization' && (
                                    <Visualization selectedFilter={selectedFilters} data={filteredData} width="100%" height="450px" />
                                )}
                                {activeTab === 'data' && <DataTable data={filteredData} width="100%" height="450px" />}
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