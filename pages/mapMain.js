import { useRef } from 'react';
import useMapInstance from '../components/useMapInstance';

const MapPage = () => {
    const mapContainerRef = useRef(null);

    const mapOptions = {
        center: { lat: -34.397, lng: 150.644 },
        zoom: 8,
    };

    useMapInstance(mapContainerRef, mapOptions);

    return (
        <div>
            <div
                ref={mapContainerRef}
                style={{ width: '100%', height: '500px' }}
            ></div>
        </div>
    );
};

export default MapPage;
