import React from 'react';
import * as leaflet from 'leaflet'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'

import Visualization from '../Visualization/Visualization';

import 'leaflet/dist/leaflet.css';
import "leaflet/dist/images/marker-shadow.png"

interface MapProps {
    data: any[];
    width?: number | string;
    height?: number | string;
}

const Map: React.FC<MapProps> = ({ data, width = '100%', height = 500 }) => {
    const [mapState, setMapState] = React.useState(
        {
          lat: 41.257017,
          lng: 29.077524,
          zoom: 13,
        }
      )
    

    return (
        <div
            id="map"
            style={{
                position: 'relative',
                width: '100%',
                height: '500px',
                zIndex: 1,
                overflow: 'hidden',
            }}
        >
            <MapContainer
                center={[51.505, -0.09]}
                zoom={13}
                scrollWheelZoom={false}
                style={{
                    height: '100%',
                    width: '100%',
                    position: 'relative',
                    zIndex: 0,
                }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="http://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png"
                />
                <Marker position={[51.505, -0.09]}>
                    <Popup>
                        <Visualization data={data} width="300px" height="200px" />
                    </Popup>
                </Marker>
            </MapContainer>
            
        </div>
    );
};

export default Map;
