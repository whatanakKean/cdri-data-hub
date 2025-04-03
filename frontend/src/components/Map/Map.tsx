import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import geojsonData from '../../assets/geojson/geoBoundaries-KHM-ADM1_simplified.json';
import 'leaflet/dist/leaflet.css';
import { GeoJsonObject } from 'geojson';
import Visualization from '../Visualization/Visualization';

interface MapProps {
  data: any[];
  width?: number | string;
  height?: number | string;
}

const Map: React.FC<MapProps> = ({ data, width = '100%', height = 500 }) => {
  const [hoveredProvince, setHoveredProvince] = useState<any | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    console.log('Data:', data);
    console.log('GeoJSON:', geojsonData);
  }, [data]);

  useEffect(() => {
    console.log('Hovered Province:', hoveredProvince);
    console.log('Tooltip Position:', tooltipPosition);
  }, [hoveredProvince, tooltipPosition]);

  const getColor = (value: number) => {
    return value > 100000 ? '#006400' :
           value > 50000  ? '#008000' :
           value > 20000  ? '#228B22' :
           value > 10000  ? '#2E8B57' :
           value > 5000   ? '#3CB371' :
           value > 1000   ? '#90EE90' :
                            '#98FF98';
  };

  const styleFeature = (feature: any) => {
    const provinceName = feature.properties.shapeName;
    const provinceData = data.find(item => item.province === provinceName);
    const value = provinceData ? provinceData.indicator_value : 0;

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
        const provinceName = feature.properties.shapeName;
        const provinceData = data.find(item => item.province === provinceName);

        layer.setStyle({
          weight: 3,
          color: '#666',
          dashArray: '',
        });

        const { x, y } = e.containerPoint;
        setTooltipPosition({ x, y });
        setHoveredProvince(provinceData || { province: provinceName, indicator_value: 'N/A' });
      },
      mouseout: (e: L.LeafletMouseEvent) => {
        const layer = e.target;
        layer.setStyle({
          weight: 1,
          color: 'white',
          dashArray: '3',
        });
        setHoveredProvince(null);
        setTooltipPosition(null);
      },
    });
  };

  return (
    <div
      id="map"
      style={{
        position: 'relative',
        width: width,
        height: height,
        zIndex: 1,
        overflow: 'visible', // Changed to visible to prevent clipping
      }}
    >
      <MapContainer
        center={[12.5657, 104.9910]}
        zoom={7}
        scrollWheelZoom={false}
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

      {hoveredProvince && tooltipPosition && (
        <div
          style={{
            position: 'absolute',
            left: tooltipPosition.x + 10,
            top: tooltipPosition.y + 10,
            zIndex: 1000,
            background: 'white', // Added for visibility
            border: '1px solid #ccc', // Added for visibility
            borderRadius: '3px',
            padding: '5px',
            pointerEvents: 'none',
          }}
        >
          <Visualization
            data={[hoveredProvince]}
            width="250px"
            height="250px"
          />
        </div>
      )}
    </div>
  );
};

export default Map;