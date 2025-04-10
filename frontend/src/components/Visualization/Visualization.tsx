import React, { useMemo } from 'react'; // Replace useEffect with useMemo for clarity
import ReactECharts from 'echarts-for-react';
import { EChartsOption, LineSeriesOption } from 'echarts';

interface DataItem {
  [key: string]: any;
  year: string | number;
  indicator_value: number;
  tag?: string;
  indicator?: string;
  indicator_unit?: string;
}

interface VisualizationProps {
  selectedFilter: { [key: string]: any };
  data: DataItem[];
  width?: number | string;
  height?: number | string;
}

const Visualization: React.FC<VisualizationProps> = ({ selectedFilter, data, width = '100%', height = 500 }) => {
  // Log updates for debugging (optional, can remove later)
  // useEffect(() => {
  //   console.log("Viz Filter: ", selectedFilter);
  //   console.log("Viz Data: ", data);
  // }, [selectedFilter, data]); // Include data in dependencies

  // Use useMemo to ensure option is recalculated only when dependencies change
  const option: EChartsOption = useMemo(() => {
    const categoryKey = Object.keys(selectedFilter).find(
      key => Array.isArray(selectedFilter[key]) && selectedFilter[key].every((item: any) => typeof item === 'string')
    ) || 'province';

    const categories = Array.from(new Set(data.map(item => item[categoryKey] || ''))).filter(Boolean);
    const years = Array.from(new Set(data.map(item => item.year))).sort();

    const seriesData: LineSeriesOption[] = categories.map(category => {
      const categoryData = data.filter(item => item[categoryKey] === category);
      const values = years.map(year => {
        const item = categoryData.find(d => d.year === year);
        return item ? item.indicator_value : null;
      });

      return {
        name: category,
        type: 'line',
        data: [...values], // Ensure new array reference
        markPoint: {
          data: [
            {
              type: 'max',
              name: category,
              label: {
                show: true,
                position: 'right',
                formatter: category,
                color: '#000',
                fontSize: 12,
              },
              symbol: 'none',
            },
          ],
        },
        endLabel: {
          show: true,
          formatter: () => category, // Simplify formatter
        },
      };
    });

    return {
      title: {
        text: data[0]?.tag || selectedFilter.indicator || 'Chart Title',
      },
      tooltip: {
        trigger: 'axis',
      },
      toolbox: {
        feature: {
          saveAsImage: {},
        },
      },
      grid: {
        left: '3%',
        right: '10%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: [
        {
          type: 'category',
          boundaryGap: false,
          data: [...years], // Ensure new array reference
        },
      ],
      yAxis: [
        {
          type: 'value',
          name: data[0]?.indicator_unit || 'Value',
        },
      ],
      series: seriesData,
    };
  }, [data, selectedFilter]); // Recalculate when data or selectedFilter changes

  return (
    <div>
      <ReactECharts
        option={option}
        opts={{ renderer: 'svg' }}
        style={{ width, height }}
        notMerge={true}
      />
    </div>
  );
};

export default Visualization;