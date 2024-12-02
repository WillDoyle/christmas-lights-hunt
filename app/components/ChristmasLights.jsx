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
        <div className="min-h-screen w-full bg-gradient-to-br from-green-50 to-red-50">
            <Card className="w-full min-h-screen border-none bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-4 space-y-4">
                    <CardTitle className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
                        <span className="font-outfit text-2xl sm:text-3xl font-black bg-gradient-to-r from-green-600 to-red-600 text-transparent bg-clip-text tracking-tight">
                            Will and Lixey&apos;s Christmas Light Hunt
                            <span className="block text-sm sm:text-base font-medium text-gray-500 mt-1">
                                Brisbane & Moreton Bay Region
                            </span>
                        </span>
                        <div className="relative w-full sm:w-72">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                            <Input
                                type="text"
                                placeholder="Search suburbs or streets..."
                                className="pl-8 border-2 border-gray-200 focus:border-green-500 transition-colors rounded-xl font-outfit w-full"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="grid grid-cols-1 md:grid-cols-4 min-h-[calc(100vh-8rem)]">
                        {/* Mobile Tab Bar */}
                        <div className="md:hidden flex justify-center border-b bg-white sticky top-0 z-10">
                            <button
                                onClick={() => document.getElementById('locationsList').scrollIntoView({ behavior: 'smooth' })}
                                className="flex-1 py-3 text-center font-medium text-gray-600 border-b-2 border-green-500"
                            >
                                Locations List
                            </button>
                            <button
                                onClick={() => document.getElementById('map').scrollIntoView({ behavior: 'smooth' })}
                                className="flex-1 py-3 text-center font-medium text-gray-600 border-b-2 border-transparent"
                            >
                                Map View
                            </button>
                        </div>

                        {/* Locations List */}
                        <div id="locationsList" className="p-4 border-r overflow-y-auto md:max-h-[calc(100vh-10rem)] bg-white/50">
                            <h2 className="md:hidden font-outfit text-lg font-bold mb-4">All Locations</h2>
                            {Object.entries(locations)
                                .filter(([suburb, streets]) => {
                                    const search = searchTerm.toLowerCase();
                                    return suburb.toLowerCase().includes(search) ||
                                        streets.some(street => street.toLowerCase().includes(search));
                                })
                                .map(([suburb, streets]) => (
                                    <div key={suburb} className="mb-6 hover:bg-white/80 p-3 rounded-xl transition-all duration-200">
                                        <h3 className="font-outfit text-sm font-bold text-green-700 flex items-center">
                                            <MapPin className="h-4 w-4 mr-1" />
                                            {suburb}
                                            <span className="ml-2 text-xs text-gray-500 font-medium">
                                                ({streets.length} locations)
                                            </span>
                                        </h3>
                                        <ul className="mt-2 ml-5 space-y-2">
                                            {streets.map((street) => (
                                                <li
                                                    key={street}
                                                    onClick={() => {
                                                        handleStreetClick(suburb, street);
                                                        // On mobile, scroll to map after selection
                                                        if (window.innerWidth < 768) {
                                                            document.getElementById('map').scrollIntoView({ behavior: 'smooth' });
                                                        }
                                                    }}
                                                    className={`font-outfit text-sm cursor-pointer transition-all duration-200
                                                        ${selectedLocation?.street === street
                                                            ? 'text-green-600 font-semibold scale-102'
                                                            : 'text-gray-600 hover:text-green-600 hover:translate-x-1'
                                                        }`}
                                                >
                                                    {selectedLocation?.street === street ? '📍' : '🎄'} {street}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                        </div>

                        {/* Map Container */}
                        <div id="map" className="col-span-1 md:col-span-3 h-[50vh] md:h-[calc(100vh-10rem)] relative">
                            <div ref={mapRef} className="w-full h-full rounded-xl overflow-hidden" />
                            <div
                                ref={popupRef}
                                className="absolute bg-white p-4 rounded-xl shadow-lg border-2 border-green-500/20 font-outfit min-w-[200px] max-w-[90vw] md:max-w-[300px]"
                            >
                                {selectedLocation && (
                                    <div className="space-y-3">
                                        <div>
                                            <div className="font-bold text-green-700 text-lg">
                                                🎄 {selectedLocation.street}
                                            </div>
                                            <div className="text-gray-600">
                                                {selectedLocation.suburb}
                                            </div>
                                        </div>

                                        <a
                                            href={`https://www.google.com/maps/search/?api=1&query=${selectedLocation.street}+${selectedLocation.suburb}+Brisbane+QLD`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-center gap-2 text-sm bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors w-full font-medium"
                                        >
                                            <Navigation className="h-4 w-4" />
                                            Open in Google Maps
                                            <ExternalLink className="h-3 w-3" />
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ChristmasLightsMap;