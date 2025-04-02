import React from 'react';
import ReactECharts from 'echarts-for-react';
import { EChartsOption } from 'echarts';


interface VisualizationProps {
    data: any[];
    width?: number | string;
    height?: number | string;
}

const Visualization: React.FC<VisualizationProps> = ({ data, width = '100%', height = 500 }) => {
    // Extract years and values
    const xAxisData = data.map(item => item.year);
    const yAxisData = data.map(item => item.indicator_value);

    const option: EChartsOption = {
        title: {
            text: data[0]?.tag || 'Chart Title',
        },
        tooltip: {
            trigger: 'axis',
        },
        legend: {
            data: [data[0]?.indicator || 'Indicator'],
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
                type: 'category',
                boundaryGap: false,
                data: xAxisData,
            },
        ],
        yAxis: [
            {
                type: 'value',
                name: data[0]?.indicator_unit || 'Value',
            },
        ],
        series: [
            {
                name: data[0]?.indicator || 'Indicator',
                type: 'line',
                stack: 'Total',
                areaStyle: {},
                data: yAxisData,
            },
        ],
    };
    return <ReactECharts option={option} style={{ width, height, paddingTop: 20 }} />;
};

export default Visualization;
