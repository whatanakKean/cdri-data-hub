// src/components/Map/MapTooltip.tsx

import React, {useEffect} from 'react';
import { Popover, Box, Text } from '@mantine/core';
import ReactECharts from 'echarts-for-react';
import { EChartsOption } from 'echarts';

interface MapTooltipProps {
  hoveredFeature: any;
  tooltipPosition: { x: number; y: number };
  keyProperty: string;
}

const MapTooltip: React.FC<MapTooltipProps> = ({ hoveredFeature, tooltipPosition, keyProperty }) => {
  if (!hoveredFeature || !tooltipPosition) return null;

  useEffect(()=> {
    console.log(hoveredFeature);
  }, []);

  return (
    <div
      style={{
        position: 'absolute',
        left: tooltipPosition.x,
        top: tooltipPosition.y,
        pointerEvents: 'none',
        zIndex: 1000,
      }}
    >
      <Popover
        opened={true}
        withArrow
        offset={12}
        position="bottom"
        shadow="md"
        withinPortal
      >
        <Popover.Target>
          <div style={{ width: 1, height: 1 }} />
        </Popover.Target>

        <Popover.Dropdown p={0}>
          {hoveredFeature.indicator_value === 'N/A' ? (
            <Text>{`${hoveredFeature[keyProperty]}: No data`}</Text>
          ) : (
            <Box>
              <Text p="xs" fw={500} bg="gray.1">
                {hoveredFeature[0][keyProperty]}
              </Text>
              <Box p="xs">
                <VisualizationToollip
                  data={hoveredFeature}
                  width="300px"
                  height="200px"
                />
              </Box>
            </Box>
          )}
        </Popover.Dropdown>
      </Popover>
    </div>
  );
};


interface VisualizationProps {
    data: any[];
    width?: number | string;
    height?: number | string;
}

const VisualizationToollip: React.FC<VisualizationProps> = ({ data, width = '100%', height = 500 }) => {
    // Extract years and values
    const xAxisData = data.map(item => item.year);
    const yAxisData = data.map(item => item.indicator_value);

    const option: EChartsOption = {
        // title: {
        //     text: data[0]?.tag || 'Chart Title',
        // },
        tooltip: {
            trigger: 'axis',
        },
        grid: {
            top: '5%',
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
                data: yAxisData,
            },
        ],
    };
    return(
        <div>
            <ReactECharts option={option} opts={{ renderer: 'svg' }} style={{ width, height }} />
        </div>
    );
    
};

export default MapTooltip;
