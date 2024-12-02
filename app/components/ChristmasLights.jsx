'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, MapPin, Navigation, ExternalLink } from 'lucide-react';
import 'ol/ol.css';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat, transform } from 'ol/proj';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { Style, Fill, Stroke, Circle, Text } from 'ol/style';
import Overlay from 'ol/Overlay';
import { locations } from './location';

const BRISBANE_CENTER = [153.0251, -27.4698];
const ZOOM_LEVEL = 11;

const ChristmasLightsMap = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLocation, setSelectedLocation] = useState(null);
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const vectorSourceRef = useRef(null);
    const popupRef = useRef(null);
    const overlayRef = useRef(null);

    useEffect(() => {
        // Initialize map
        const vectorSource = new VectorSource();
        vectorSourceRef.current = vectorSource;

        // Create a style for the pin
        const pinStyle = new Style({
            image: new Circle({
                radius: 8,
                fill: new Fill({ color: 'red' }),
                stroke: new Stroke({ color: 'white', width: 2 })
            }),
            text: new Text({
                text: '📍',
                scale: 1.2,
                offsetY: -15,
                fill: new Fill({ color: '#e74c3c' })
            })
        });

        const vectorLayer = new VectorLayer({
            source: vectorSource,
            style: pinStyle
        });

        const map = new Map({
            target: mapRef.current,
            layers: [
                new TileLayer({
                    source: new OSM()
                }),
                vectorLayer
            ],
            view: new View({
                center: fromLonLat(BRISBANE_CENTER),
                zoom: ZOOM_LEVEL
            })
        });

        // Create popup overlay
        const overlay = new Overlay({
            element: popupRef.current,
            positioning: 'bottom-center',
            offset: [0, -10],
            autoPan: true,
            autoPanAnimation: {
                duration: 250
            }
        });

        map.addOverlay(overlay);
        overlayRef.current = overlay;
        mapInstanceRef.current = map;

        // Add click handler for the map
        map.on('click', (event) => {
            const feature = map.forEachFeatureAtPixel(event.pixel, (feature) => feature);

            if (feature) {
                const coords = feature.getGeometry().getCoordinates();
                const { suburb, street } = feature.getProperties();

                overlayRef.current.setPosition(coords);
                setSelectedLocation({ suburb, street });
            } else {
                overlayRef.current.setPosition(undefined);
                setSelectedLocation(null);
            }
        });

        return () => {
            map.setTarget(undefined);
        };
    }, []);

    const handleStreetClick = async (suburb, street) => {
        try {
            // Geocode the address using Nominatim
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${street},${suburb},Brisbane,Australia`
            );
            const data = await response.json();

            if (data && data[0]) {
                const { lon, lat } = data[0];
                const coordinates = fromLonLat([parseFloat(lon), parseFloat(lat)]);

                // Clear existing features
                vectorSourceRef.current.clear();

                // Add new marker with properties
                const feature = new Feature({
                    geometry: new Point(coordinates),
                    suburb,
                    street
                });

                vectorSourceRef.current.addFeature(feature);

                // Set popup position
                overlayRef.current.setPosition(coordinates);

                // Update selected location
                setSelectedLocation({ suburb, street });

                // Pan to location
                mapInstanceRef.current.getView().animate({
                    center: coordinates,
                    zoom: 16,
                    duration: 1000
                });
            }
        } catch (error) {
            console.error('Error geocoding address:', error);
        }
    };
    return (
        <div className="min-h-screen w-full bg-[#f5f5f7]">
            <div className="w-full min-h-screen relative">
                {/* Header */}
                <div className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-xl z-20 border-b border-gray-200/50">
                    <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6">
                        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                            <div className="flex-1">
                                <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">
                                    Christmas Light Hunt
                                    <span className="block text-sm text-gray-500 font-normal mt-0.5">
                                        Brisbane & Moreton Bay Region
                                    </span>
                                </h1>
                            </div>
                            <div className="relative w-full sm:w-72">
                                <div className="absolute inset-0 bg-gray-100/50 rounded-xl backdrop-blur-sm -z-10" />
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                <Input
                                    type="text"
                                    placeholder="Search locations..."
                                    className="w-full pl-10 h-9 bg-gray-100/50 border-0 rounded-xl text-sm placeholder:text-gray-400 focus:ring-2 focus:ring-gray-900/10 focus:bg-white/50"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="pt-28 md:pt-24 pb-6 px-4 sm:px-6">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            {/* Sidebar */}
                            <div className="md:col-span-1">
                                <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-sm border border-gray-200/50">
                                    <div className="p-4">
                                        <div className="space-y-4">
                                            {Object.entries(locations)
                                                .filter(([suburb, streets]) => {
                                                    const search = searchTerm.toLowerCase();
                                                    return suburb.toLowerCase().includes(search) ||
                                                        streets.some(street => street.toLowerCase().includes(search));
                                                })
                                                .map(([suburb, streets]) => (
                                                    <div key={suburb}
                                                        className="pb-4 last:pb-0 border-b last:border-0 border-gray-100">
                                                        <h3 className="flex items-center text-sm font-medium text-gray-900">
                                                            <MapPin className="h-4 w-4 mr-1.5 text-gray-400" />
                                                            {suburb}
                                                            <span className="ml-auto text-xs text-gray-400">
                                                                {streets.length}
                                                            </span>
                                                        </h3>
                                                        <ul className="mt-2 ml-6 space-y-1.5">
                                                            {streets.map((street) => (
                                                                <li
                                                                    key={street}
                                                                    onClick={() => handleStreetClick(suburb, street)}
                                                                    className={`text-sm cursor-pointer transition-all
                                                                        ${selectedLocation?.street === street
                                                                            ? 'text-blue-600 font-medium'
                                                                            : 'text-gray-600 hover:text-gray-900'
                                                                        }`}
                                                                >
                                                                    {selectedLocation?.street === street ? '📍' : '·'} {street}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Map */}
                            <div className="md:col-span-3">
                                <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-sm border border-gray-200/50 overflow-hidden h-[calc(100vh-8rem)]">
                                    <div ref={mapRef} className="w-full h-full" />
                                    <div
                                        ref={popupRef}
                                        className="absolute bg-white/90 backdrop-blur-xl p-4 rounded-2xl shadow-lg border border-gray-200/50 min-w-[240px] max-w-[90vw] md:max-w-[320px]"
                                    >
                                        {selectedLocation && (
                                            <div className="space-y-3">
                                                <div className="space-y-1">
                                                    <div className="font-medium text-gray-900">
                                                        {selectedLocation.street}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {selectedLocation.suburb}
                                                    </div>
                                                </div>

                                                <a
                                                    href={`https://www.google.com/maps/search/?api=1&query=${selectedLocation.street}+${selectedLocation.suburb}+Brisbane+QLD`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center justify-center gap-2 text-sm bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-xl transition-colors w-full font-medium"
                                                >
                                                    <Navigation className="h-4 w-4" />
                                                    Open in Maps
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChristmasLightsMap;