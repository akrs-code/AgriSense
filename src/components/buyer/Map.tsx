import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster'; 
import { Tooltip } from 'react-leaflet';



const productIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const sellerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

type CommonMarker = {
  lat: number;
  lng: number;
  label: string;
};

export type ProductMarkerData = CommonMarker & {
  type: 'product';
  productId: string;
  price: number;
  unit: string;
  category: string;
  condition: string;
  sellerName?: string;
  businessName?: string;
  address?: string;
};

export type SellerMarkerData = CommonMarker & {
  type: 'seller';
  sellerId: string; 
  businessName?: string;
  sellerName: string;
  address?: string; 
  products: Array<{
    productId: string;
    name: string;
    price: number;
    unit: string;
    category: string;
    condition: string;
  }>;

  profileImageUrl?: string;
  email?: string;          
  phone?: string;           
};


export type UserMarkerData = CommonMarker & {
  type: 'user';
};

type MarkerData = ProductMarkerData | SellerMarkerData | UserMarkerData;

interface MapProps {
  center: [number, number];
  markers: MarkerData[];
  radiusKm?: number;
  onProductMarkerClick?: (productId: string) => void;
  onSellerMarkerClick?: (sellerId: string) => void;
  viewMode: 'products' | 'sellers';
}


const MapComponent: React.FC<MapProps> = ({
  center,
  markers,
  radiusKm,
  onProductMarkerClick,
  onSellerMarkerClick,
  viewMode,
}) => {
  const productMarkers = markers.filter(m => m.type === 'product') as ProductMarkerData[];
  const sellerMarkers = markers.filter(m => m.type === 'seller') as SellerMarkerData[];
  const userMarkers = markers.filter(m => m.type === 'user') as UserMarkerData[];

  return (
    <MapContainer center={center} zoom={12} scrollWheelZoom={true} className="w-full h-[400px] z-0">
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="© OpenStreetMap contributors"
      />

      {radiusKm && (
        <Circle
          center={center}
          radius={radiusKm * 1000}
          pathOptions={{ color: 'blue', fillColor: '#add8e6', fillOpacity: 0.2 }}
        />
      )}

      {/* Cluster for Product Markers */}
      <MarkerClusterGroup
        iconCreateFunction={(cluster: L.MarkerCluster) => {
          return L.divIcon({
            html: `<div><span>${cluster.getChildCount()}</span></div>`,
            className: 'marker-cluster marker-cluster-products',
            iconSize: L.point(40, 40, true),
          });
        }}
      >
        {productMarkers.map((marker, idx) => (
          <Marker
            key={`product-${idx}`}
            position={[marker.lat, marker.lng]}
            icon={productIcon}
            eventHandlers={{
              click: () => onProductMarkerClick?.(marker.productId)
            }}
          >
            <Tooltip direction="top" offset={[0, -10]} opacity={1} permanent={false}>
            {viewMode === 'products' ? (
              <div>
                <p className="font-semibold text-sm text-black">{marker.label}</p>
                <p className="text-xs text-gray-500">
                  Category: {marker.category} | Condition: {marker.condition}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {marker.address || 'No address provided'}
                </p>
              </div>
            ) : (
              <p>{marker.label}</p>
            )}
          </Tooltip>


          </Marker>
        ))}
      </MarkerClusterGroup>

      {/* Cluster for Seller Markers */}
      <MarkerClusterGroup
        iconCreateFunction={(cluster) => {
          return L.divIcon({
            html: `<div><span>${cluster.getChildCount()}</span></div>`,
            className: 'marker-cluster marker-cluster-sellers',
            iconSize: L.point(40, 40, true),
          });
        }}
      >
        {sellerMarkers.map((marker, idx) => (
          <Marker
            key={`seller-${idx}`}
            position={[marker.lat, marker.lng]}
            icon={sellerIcon}
            eventHandlers={{
              click: () => onSellerMarkerClick?.(marker.sellerId)
            }}
          >
            <Tooltip direction="top" offset={[0, -10]} opacity={1} permanent={false}>
              {viewMode === 'sellers' ? (
                <div>
                  <strong>{marker.businessName || marker.sellerName}</strong>
                  <br />
                  <span className="text-xs">{marker.address || 'No address provided'}</span>
                </div>
              ) : (
                <p>{marker.label}</p>
              )}
            </Tooltip>

          </Marker>
        ))}
      </MarkerClusterGroup>

      {/* User Marker (not clustered) */}
      {userMarkers.map((marker, idx) => (
        <Marker
          key={`user-${idx}`}
          position={[marker.lat, marker.lng]}
          icon={userIcon}
        >
          <Popup>{marker.label}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MapComponent;
