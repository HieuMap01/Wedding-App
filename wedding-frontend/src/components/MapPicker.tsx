'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

// Dynamic imports for react-leaflet components to avoid SSR errors
const MapContainer = dynamic(() => import('react-leaflet').then(m => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(m => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(m => m.Marker), { ssr: false });

// We'll use a wrapper component for hooks
function MapEventsWrapper({ onMapClick, position }: { onMapClick: (lat: number, lng: number) => void, position: [number, number] }) {
    const { useMapEvents } = require('react-leaflet');
    const map = useMapEvents({
        click(e: any) {
            onMapClick(e.latlng.lat, e.latlng.lng);
        },
    });

    useEffect(() => {
        if (map) map.setView(position);
    }, [position, map]);

    return null;
}

interface MapPickerProps {
    label?: string;
    address?: string;
    lat?: string | number;
    lng?: string | number;
    onLocationSelect: (lat: number, lng: number, address?: string) => void;
}

export default function MapPicker({ label, address, lat, lng, onLocationSelect }: MapPickerProps) {
    const defaultPos: [number, number] = [10.762622, 106.660172]; // HCMC
    const [position, setPosition] = useState<[number, number]>(
        lat && lng ? [parseFloat(lat.toString()), parseFloat(lng.toString())] : defaultPos
    );
    const [searchQuery, setSearchQuery] = useState(address || '');
    const [isSearching, setIsSearching] = useState(false);
    const [L, setL] = useState<any>(null);

    // Load Leaflet on client side to fix marker icons
    useEffect(() => {
        import('leaflet').then((leaflet) => {
            setL(leaflet);
            // Fix Leaflet's default icon path issues in Next.js
            delete (leaflet.Icon.Default.prototype as any)._getIconUrl;
            
            // Custom red marker icon to match Google Maps style
            const RedIcon = leaflet.icon({
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41]
            });
            leaflet.Marker.prototype.options.icon = RedIcon;
        });
    }, []);

    const [mapType, setMapType] = useState<'roadmap' | 'satellite'>('roadmap');

    // Google Maps Tile URLs (Unofficial but widely used)
    const roadmapUrl = "https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}";
    const satelliteUrl = "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}";

    const handleSearch = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const query = searchQuery.trim();
        if (!query) return;

        // Check if query is a Google Maps link (either long or short)
        // Extracting lat,lng from various Google Maps link formats
        const gmapsCoordRegex = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
        const gmapsQueryRegex = /q=(-?\d+\.\d+),(-?\d+\.\d+)/;
        const match = query.match(gmapsCoordRegex) || query.match(gmapsQueryRegex);
        
        if (match) {
            const lat = parseFloat(match[1]);
            const lng = parseFloat(match[2]);
            const newPos: [number, number] = [lat, lng];
            setPosition(newPos);
            onLocationSelect(lat, lng, 'Vị trí từ Google Maps');
            return;
        }

        setIsSearching(true);
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);

            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
                { signal: controller.signal }
            );
            clearTimeout(timeoutId);

            const data = await response.json();
            if (data && data.length > 0) {
                const newPos: [number, number] = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
                setPosition(newPos);
                onLocationSelect(newPos[0], newPos[1], data[0].display_name);
            } else {
                alert('Không tìm thấy địa điểm này. Bạn hãy thử:\n1. Kiểm tra lại tên địa chỉ (ví dụ: Lục Nam, Bắc Giang).\n2. Mở Google Maps, tìm vị trí rồi copy LINK dán vào đây.\n3. Click trực tiếp lên bản đồ để chọn.');
            }
        } catch (error) {
            console.error('Search failed:', error);
            alert('Lỗi kết nối. Vui lòng thử lại hoặc chọn vị trí bằng cách click lên bản đồ.');
        } finally {
            setIsSearching(false);
        }
    };


    const eventHandlers = useMemo(
        () => ({
            dragend(e: any) {
                const marker = e.target;
                if (marker != null) {
                    const pos = marker.getLatLng();
                    const newPos: [number, number] = [pos.lat, pos.lng];
                    setPosition(newPos);
                    onLocationSelect(newPos[0], newPos[1]);
                }
            },
        }),
        [onLocationSelect]
    );

    if (!L) return <div className="h-[300px] w-full bg-slate-100 animate-pulse rounded-xl flex items-center justify-center text-slate-400">Đang tải bản đồ...</div>;

    const openInGoogleMaps = () => {
        window.open(`https://www.google.com/maps/search/?api=1&query=${position[0]},${position[1]}`, '_blank');
    };

    return (
        <div className="space-y-3">
            {label && <label className="block text-sm font-semibold text-slate-700">{label}</label>}
            
            <div className="flex gap-2">
                <input
                    className="input-field text-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Nhập địa chỉ hoặc dán link Google Maps..."
                />
                <button
                    type="button"
                    onClick={() => handleSearch()}
                    disabled={isSearching}
                    className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-bold hover:bg-slate-700 transition-colors disabled:opacity-50"
                >
                    {isSearching ? '...' : '🔍 Tìm'}
                </button>
            </div>
            <p className="text-[10px] text-slate-400 mt-1 px-1 italic">
                💡 Mẹo: Bạn có thể dán trực tiếp <b>Link chia sẻ từ Google Maps</b> vào ô trên để lấy vị trí chính xác nhất.
            </p>

            <div className="h-[350px] w-full rounded-xl overflow-hidden border border-slate-200 z-10 relative group">
                <MapContainer center={position} zoom={15} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                        url={mapType === 'roadmap' ? roadmapUrl : satelliteUrl}
                    />
                    <Marker
                        position={position}
                        draggable={true}
                        eventHandlers={eventHandlers}
                    />
                    <MapEventsWrapper 
                        position={position} 
                        onMapClick={(lat, lng) => {
                            const newPos: [number, number] = [lat, lng];
                            setPosition(newPos);
                            onLocationSelect(lat, lng);
                        }} 
                    />
                </MapContainer>
                
                {/* Floating Map Controls */}
                <div className="absolute top-2 left-2 z-[1000] flex flex-col gap-2">
                    <button 
                        type="button"
                        onClick={openInGoogleMaps}
                        className="bg-white/95 backdrop-blur px-3 py-1.5 rounded-lg text-[11px] font-bold text-slate-700 shadow-md hover:bg-slate-50 flex items-center gap-1.5 border border-slate-100"
                    >
                        <span>🗺️</span> Mở trong Google Maps
                    </button>
                </div>

                <div className="absolute bottom-4 left-4 z-[1000] flex gap-2">
                    <button 
                        type="button"
                        onClick={() => setMapType('roadmap')}
                        className={`px-3 py-1.5 rounded-lg text-[11px] font-bold shadow-md transition-all ${mapType === 'roadmap' ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 hover:bg-slate-50'}`}
                    >
                        Bản đồ
                    </button>
                    <button 
                        type="button"
                        onClick={() => setMapType('satellite')}
                        className={`px-3 py-1.5 rounded-lg text-[11px] font-bold shadow-md transition-all ${mapType === 'satellite' ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 hover:bg-slate-50'}`}
                    >
                        Vệ tinh
                    </button>
                </div>

                <div className="absolute bottom-2 right-2 z-[1000] bg-black/40 backdrop-blur px-2 py-1 rounded text-[9px] text-white pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                    Kéo pin đỏ hoặc click bản đồ để chọn vị trí
                </div>
            </div>
        </div>
    );
}
