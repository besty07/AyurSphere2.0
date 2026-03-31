import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Create a safe, local icon instance instead of corrupting the global prototype
const customMarkerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

class MapErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, message: error.toString() };
  }
  render() {
    if (this.state.hasError) return <div style={{padding:'20px', color:'red'}}>Map crashed: {this.state.message}</div>;
    return this.props.children;
  }
}

const LocationMarker = ({ position, setPosition }) => {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position === null ? null : (
    <Marker position={position} icon={customMarkerIcon}></Marker>
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

// Component to force Leaflet to recalculate container dimensions when modal opens
const MapSizeFixer = () => {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
};

const LocationPickerModal = ({ isOpen, onClose, onConfirm }) => {
  const [position, setPosition] = useState(null);
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  // Auto-locate the user immediately when the modal opens!
  useEffect(() => {
    if (isOpen && !position) {
      setIsLocating(true);
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
            setIsLocating(false);
          }, 
          (err) => {
            console.warn("Geolocation Error:", err.message);
            alert("Precise GPS access failed or was denied. Defaulting to general map. Please allow location permissions in your browser.");
            setPosition({ lat: 20.5937, lng: 78.9629 }); // Fallback to India
            setIsLocating(false);
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      } else {
        setPosition({ lat: 20.5937, lng: 78.9629 }); // Fallback
        setIsLocating(false);
      }
    }
  }, [isOpen]); // Only run when open state toggles

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
          {isLocating ? (
            <div style={{ height: '350px', width: '100%', borderRadius: '8px', background: '#f4f9f1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px dashed #d4e8cc' }}>
              <i className="fas fa-spinner fa-spin" style={{ fontSize: '2.5rem', color: '#2d7318', marginBottom: '1rem' }}></i>
              <span style={{ color: '#4a5c43', fontWeight: 600 }}>Acquiring GPS Signal...</span>
              <span style={{ color: '#728c66', fontSize: '0.8rem', marginTop: '0.5rem' }}>Please allow location access if prompted</span>
            </div>
          ) : (
            <MapErrorBoundary>
              <MapContainer 
                center={position} 
                zoom={15} 
                style={{ height: '350px', width: '100%', borderRadius: '8px' }}
              >
                <TileLayer
                  attribution='&copy; OpenStreetMap'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapSizeFixer />
                {position && <MapCenterer center={position} />}
                <LocationMarker position={position} setPosition={setPosition} />
              </MapContainer>
            </MapErrorBoundary>
          )}
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
