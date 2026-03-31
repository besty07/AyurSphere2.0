import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix leaflet default icon issue in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const LocationMarker = ({ position, setPosition }) => {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position === null ? null : (
    <Marker position={position}></Marker>
  );
};

// Component to handle auto-centering when "Current Location" is fetched
const MapCenterer = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, 15);
  }, [center, map]);
  return null;
};

const LocationPickerModal = ({ isOpen, onClose, onConfirm }) => {
  const [position, setPosition] = useState(null);
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If we have a position, attempt to reverse-geocode it to a string
    if (position) {
      fetchAddress(position.lat, position.lng);
    }
  }, [position]);

  const fetchAddress = async (lat, lng) => {
    try {
      setLoading(true);
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
      const data = await res.json();
      if (data && data.display_name) {
        setAddress(data.display_name);
      }
    } catch (err) {
      console.error('Geocoding error:', err);
      setAddress('Coordinates: ' + lat.toFixed(4) + ', ' + lng.toFixed(4));
    } finally {
      setLoading(false);
    }
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      }, () => {
        alert("Geolocation access denied or failed.");
      });
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  const handleConfirm = () => {
    if (address) {
      onConfirm(address);
      onClose();
    } else {
      alert("Please select a location on the map first.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="loc-modal-overlay">
      <div className="loc-modal-content">
        <div className="loc-modal-header">
          <h3><i className="fas fa-map-marker-alt" /> Pick Your Location</h3>
          <button className="loc-close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="loc-map-container">
          <MapContainer 
            center={position || [20.5937, 78.9629]} // Default to India roughly
            zoom={position ? 15 : 4} 
            style={{ height: '350px', width: '100%', borderRadius: '8px' }}
          >
            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {position && <MapCenterer center={position} />}
            <LocationMarker position={position} setPosition={setPosition} />
          </MapContainer>
        </div>

        <div className="loc-modal-footer">
          <div className="loc-address-preview">
            {loading ? <span>Loading address...</span> : <span>{address || 'Click on the map to drop a pin'}</span>}
          </div>
          <div className="loc-actions">
            <button className="loc-btn loc-btn-current" onClick={handleUseCurrentLocation} title="Use My Current GPS Location">
              <i className="fas fa-crosshairs" />
            </button>
            <button className="loc-btn loc-btn-confirm" onClick={handleConfirm} disabled={!address}>
              Confirm Location
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationPickerModal;
