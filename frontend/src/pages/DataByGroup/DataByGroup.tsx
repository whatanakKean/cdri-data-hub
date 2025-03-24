import React, { useState, useEffect } from 'react';
import { Grid, Select, Accordion, AccordionItem, AccordionControl, AccordionPanel, Group, Text, Paper, Tabs } from '@mantine/core';
import ReactECharts from 'echarts-for-react';
import { EChartsOption } from 'echarts';
import { IconMap, IconChartBar, IconTable } from '@tabler/icons-react';
import { fetchData } from '../../services/api';

const DataByGroup: React.FC = () => {
    const [activeTab, setActiveTab] = useState("visualization");
    const [data, setData] = useState<any[]>([]);
    
    useEffect(() => {
        const getData = async () => {
            try {
                const result = await fetchData("Agriculture", "Paddy Rice Price");
                console.log('Fetched data:', result);
                setData(result);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        getData();
    }, []);

    const option: EChartsOption = {
        title: {
            text: 'Stacked Area Chart',
        },
        tooltip: {
            trigger: 'axis',
        },
        legend: {
            data: ['Email Marketing', 'Affiliate Ads', 'Video Ads'],
        },
        toolbox: {
            feature: {
                saveAsImage: {},
            },
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true,
        },
        xAxis: [
            {
                type: 'category' as const, // Explicitly type as 'category'
                boundaryGap: false,
                data: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            },
        ],
        yAxis: [
            {
                type: 'value',
            },
        ],
        series: [
            {
                name: 'Email Marketing',
                type: 'line',
                stack: 'Total',
                areaStyle: {}, // Simplified, normal is not needed
                data: [120, 132, 101, 134, 90, 230, 210],
            },
            {
                name: 'Affiliate Ads',
                type: 'line',
                stack: 'Total',
                areaStyle: {},
                data: [220, 182, 191, 234, 290, 330, 310],
            },
            {
                name: 'Video Ads',
                type: 'line',
                stack: 'Total',
                areaStyle: {},
                data: [150, 232, 201, 154, 190, 330, 410],
            },
        ],
    };

    return (
        <Grid p={10}>
            <Grid.Col span={{ base: 12, sm: 3 }}>
                <Paper p="md" radius="md" shadow="xs" withBorder>
                    <Select
                        label="Select Dataset"
                        value="Dataset 1"
                        data={[
                            { label: 'Dataset 1', value: 'Dataset 1' },
                            { label: 'Dataset 2', value: 'Dataset 2' },
                            { label: 'Dataset 3', value: 'Dataset 3' },
                        ]}
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
                    <Select
                        label="Select Type"
                        value="Type 1"
                        data={[
                            { label: 'Type 1', value: 'Type 1' },
                            { label: 'Type 2', value: 'Type 2' },
                            { label: 'Type 3', value: 'Type 3' },
                        ]}
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
                    <Select
                        label="Select Province"
                        value="Province 1"
                        data={[
                            { label: 'Province 1', value: 'Province 1' },
                            { label: 'Province 2', value: 'Province 2' },
                            { label: 'Province 3', value: 'Province 3' },
                        ]}
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
                    <Select
                        label="Select Year"
                        value="2025"
                        data={[
                            { label: '2023', value: '2023' },
                            { label: '2024', value: '2024' },
                            { label: '2025', value: '2025' },
                        ]}
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
                    <Tabs defaultValue={activeTab}>
                        <Tabs.List grow justify="center">
                            <Tabs.Tab value="map" leftSection={<IconMap size={12} />}>Map</Tabs.Tab>
                            <Tabs.Tab value="visualization" leftSection={<IconChartBar size={12} />}>Visualization</Tabs.Tab>
                            <Tabs.Tab value="data" leftSection={<IconTable size={12} />}>Data View</Tabs.Tab>
                        </Tabs.List>

                        <Tabs.Panel value="map">
                            {data.length > 0 ? (
                                <pre>{JSON.stringify(data, null, 2)}</pre>
                            ) : (
                                <div>Loading data...</div>
                            )}
                        </Tabs.Panel>
                        <Tabs.Panel value="visualization">
                            <ReactECharts option={option} style={{ height: 400, paddingTop: 20 }} />
                        </Tabs.Panel>
                        <Tabs.Panel value="data">
                            <div>Data Table Goes Here</div>
                        </Tabs.Panel>
                    </Tabs>
                </Paper>
            </Grid.Col>
        </Grid>
    );
};

export default DataByGroup;