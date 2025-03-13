import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet'; // To handle marker icons if needed
import 'leaflet/dist/leaflet.css'; // Import Leaflet CSS

const Home = () => {
  const [message, setMessage] = useState('');
  const [position, setPosition] = useState([51.505, -0.09]); // Default position (latitude, longitude)

  useEffect(() => {
    axios.get('http://localhost:5000/')
      .then(response => setMessage(response.data))
      .catch(error => console.log(error));

    // You can update the position based on the API response or any other logic
    // For example, if your API gives coordinates, you can set them here
  }, []);

  return (
    <div>
      <h1>Home Page</h1>
      <p>{message}</p>

      {/* React Leaflet Map */}
      <MapContainer center={position} zoom={13} style={{ height: '400px', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker position={position}>
          <Popup>
            A sample marker.
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default Home;
