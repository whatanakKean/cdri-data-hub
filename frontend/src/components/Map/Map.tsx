import React, { useState, useMemo } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import geojsonProvinceData from '../../assets/geojson/geoBoundaries-KHM-ADM1_simplified.json';
import geojsonCountryData from '../../assets/geojson/countries.json';
import 'leaflet/dist/leaflet.css';
import { GeoJsonObject } from 'geojson';
import MapTooltip from './MapTooltip';

interface MapProps {
  data: any[];
  width?: number | string;
  height?: number | string;
}

const Map: React.FC<MapProps> = ({ data, width = '100%', height = 500 }) => {
  const [hoveredFeature, setHoveredFeature] = useState<any | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null);

  const typedProvinceData: GeoJsonObject = geojsonProvinceData as GeoJsonObject;
  const typedCountryData: GeoJsonObject = geojsonCountryData as GeoJsonObject;

  // Determine map level and preprocess data
  const isProvinceLevel = data.some(item => item.province && item.province !== null);
  const geojsonData: GeoJsonObject = isProvinceLevel ? typedProvinceData : typedCountryData;
  const keyProperty = isProvinceLevel ? 'province' : 'markets';

  // Create a lookup map that stores data for all years
  const dataLookup = useMemo(() => {
    const lookup: { [key: string]: any[] } = {};
    data.forEach(item => {
      const key = item[keyProperty];
      if (key) {
        if (!lookup[key]) {
          lookup[key] = [];
        }
        lookup[key].push(item); // Store all data points (including year) for this key
      }
    });
    return lookup;
  }, [data, keyProperty]);

  // Find min and max values across all years
  const values = data.map(item => item.indicator_value).filter(v => v !== undefined);
  const minValue = values.length ? Math.min(...values) : 0;
  const maxValue = values.length ? Math.max(...values) : 0;

  const getColor = (value: number) => {
    if (!value || maxValue === minValue) return '#98FF98';
    const ratio = (value - minValue) / (maxValue - minValue);
    if (ratio < 0.5) {
      const r = Math.round(152 + (60 - 152) * (ratio * 2));
      const g = Math.round(255 + (179 - 255) * (ratio * 2));
      const b = Math.round(152 + (113 - 152) * (ratio * 2));
      return `rgb(${r}, ${g}, ${b})`;
    } else {
      const r = Math.round(60 + (0 - 60) * ((ratio - 0.5) * 2));
      const g = Math.round(179 + (100 - 179) * ((ratio - 0.5) * 2));
      const b = Math.round(113 + (0 - 113) * ((ratio - 0.5) * 2));
      return `rgb(${r}, ${g}, ${b})`;
    }
  };

  const styleFeature = (feature: any) => {
    const featureName = feature.properties.shapeName;
    const featureData = dataLookup[featureName];
    // Use the most recent year's data for styling (or adjust logic as needed)
    const latestData = featureData?.length ? featureData[featureData.length - 1] : null;
    const value = latestData ? latestData.indicator_value : 0;

    return {
      fillColor: getColor(value),
      weight: 1,
      opacity: 1,
      color: 'white',
      dashArray: '3',
      fillOpacity: 0.7,
    };
  };

  const onEachFeature = (feature: any, layer: L.Layer) => {
    layer.on({
      mouseover: (e: L.LeafletMouseEvent) => {
        const layer = e.target;
        const featureName = feature.properties.shapeName;
        const featureData = dataLookup[featureName] || [];

        layer.setStyle({
          weight: 3,
          color: '#666',
          dashArray: '',
        });

        const { x, y } = e.containerPoint;
        setTooltipPosition({ x, y });
        // Pass all years' data to the tooltip
        setHoveredFeature(featureData.length ? featureData : [{ [keyProperty]: featureName, indicator_value: 'N/A' }]);
      },
      mouseout: (e: L.LeafletMouseEvent) => {
        const layer = e.target;
        layer.setStyle({
          weight: 1,
          color: 'white',
          dashArray: '3',
        });
        setHoveredFeature(null);
        setTooltipPosition(null);
      },
    });
  };

  // Dynamically calculate map bounds
  const bounds = useMemo(() => {
    const geoJsonLayer = L.geoJSON(geojsonData);
    return geoJsonLayer.getBounds();
  }, [geojsonData]);

  return (
    <div
      id="map"
      style={{
        position: 'relative',
        width: width,
        height: height,
        zIndex: 1,
        overflow: 'visible',
      }}
    >
      {data.length === 0 ? (
        <div>No data available to display the map.</div>
      ) : (
        <MapContainer
          bounds={bounds}
          scrollWheelZoom={true}
          style={{
            height: '100%',
            width: '100%',
            position: 'relative',
            zIndex: 0,
          }}
        >
          <TileLayer
            url="http://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png"
          />
          <GeoJSON
            data={geojsonData as GeoJsonObject}
            style={styleFeature}
            onEachFeature={onEachFeature}
          />
        </MapContainer>
      )}

      {hoveredFeature && tooltipPosition && (
        <MapTooltip
          hoveredFeature={hoveredFeature}
          tooltipPosition={tooltipPosition}
          keyProperty={keyProperty}
        />
      )}
    </div>
  );
};

export default Map;