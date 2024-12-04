'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, MapPin, Navigation, ExternalLink } from 'lucide-react';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

import Image from 'next/image';
import 'ol/ol.css';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat, transform } from 'ol/proj';
import { easeOut } from 'ol/easing';

import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { Vector as VectorLayer } from 'ol/layer';
import { Cluster, Vector as VectorSource } from 'ol/source';
import { Style, Fill, Stroke, Circle, Text } from 'ol/style';
import Overlay from 'ol/Overlay';
import { locations } from './location';
import candycaneGif from "@/public/candycaneline.gif"
import christmas1 from "@/public/merry-christmas-1.png"
import christmas2 from "@/public/merry-christmas-2.png"
import christmas3 from "@/public/merry-christmas-3.png"
import icon from "@/public/christmas-hunt.png"
import Link from 'next/link';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { boundingExtent } from 'ol/extent';

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
    const plugin = React.useRef(
        Autoplay({ delay: 4000, stopOnInteraction: true, loop: true })
    );

    const SUBURB_COORDINATES = {
        "Albany Creek": [152.968, -27.345],
        "Alderley": [153.006, -27.425],
        "Ascot": [153.068, -27.432],
        "Ashgrove": [152.987, -27.445],
        "Aspley": [153.012, -27.366],
        "Auchenflower": [152.990, -27.476],
        "Banyo": [153.078, -27.371],
        "Bardon": [152.970, -27.460],
        "Boondall": [153.056, -27.345],
        "Bracken Ridge": [153.032, -27.317],
        "Bridgeman Downs": [153.012, -27.353],
        "Brighton": [153.058, -27.290],
        "Brisbane City": [153.025, -27.470],
        "Bulimba": [153.063, -27.452],
        "Camp Hill": [153.078, -27.494],
        "Carina": [153.090, -27.492],
        "Carina Heights": [153.087, -27.500],
        "Carindale": [153.103, -27.504],
        "Carseldine": [153.012, -27.345],
        "Chandler": [153.156, -27.515],
        "Chermside": [153.033, -27.385],
        "Chermside West": [153.015, -27.385],
        "Clayfield": [153.055, -27.417],
        "Coopers Plains": [153.039, -27.564],
        "Coorparoo": [153.055, -27.497],
        "Deagon": [153.055, -27.328],
        "Eagle Farm": [153.078, -27.432],
        "East Brisbane": [153.052, -27.482],
        "Enoggera": [152.987, -27.425],
        "Everton Park": [152.983, -27.402],
        "Ferny Grove": [152.933, -27.402],
        "Fig Tree Pocket": [152.968, -27.532],
        "Fortitude Valley": [153.035, -27.457],
        "Geebung": [153.033, -27.371],
        "Gordon Park": [153.023, -27.417],
        "Grange": [153.015, -27.425],
        "Greenslopes": [153.045, -27.507],
        "Hamilton": [153.068, -27.437],
        "Hawthorne": [153.063, -27.462],
        "Hendra": [153.068, -27.422],
        "Herston": [153.025, -27.447],
        "Highgate Hill": [153.015, -27.485],
        "Holland Park": [153.068, -27.517],
        "Holland Park West": [153.063, -27.522],
        "Kangaroo Point": [153.035, -27.472],
        "Kedron": [153.023, -27.402],
        "Kelvin Grove": [153.015, -27.447],
        "Kenmore": [152.933, -27.507],
        "Keperra": [152.933, -27.417],
        "Lutwyche": [153.033, -27.417],
        "MacGregor": [153.078, -27.564],
        "Manly": [153.180, -27.452],
        "McDowall": [153.000, -27.367],
        "Milton": [152.998, -27.470],
        "Mitchelton": [152.977, -27.415],
        "Moorooka": [153.023, -27.532],
        "Morningside": [153.078, -27.462],
        "Mount Gravatt": [153.078, -27.532],
        "Mount Gravatt East": [153.087, -27.532],
        "New Farm": [153.045, -27.467],
        "Newmarket": [153.006, -27.437],
        "Norman Park": [153.063, -27.482],
        "Northgate": [153.068, -27.385],
        "Nudgee": [153.103, -27.371],
        "Nundah": [153.055, -27.402],
        "Paddington": [152.998, -27.462],
        "Petrie Terrace": [153.015, -27.462],
        "Pinkenba": [153.133, -27.422],
        "Red Hill": [152.998, -27.452],
        "Rocklea": [153.006, -27.532],
        "Sandgate": [153.068, -27.317],
        "Seven Hills": [153.078, -27.482],
        "Sherwood": [152.978, -27.532],
        "South Brisbane": [153.015, -27.482],
        "Spring Hill": [153.025, -27.457],
        "St Lucia": [152.998, -27.497],
        "Stafford": [153.012, -27.417],
        "Stafford Heights": [153.012, -27.402],
        "Sunnybank": [153.055, -27.564],
        "Taigum": [153.045, -27.345],
        "Taringa": [152.978, -27.492],
        "Tarragindi": [153.045, -27.522],
        "The Gap": [152.933, -27.445],
        "Tingalpa": [153.133, -27.482],
        "Toowong": [152.987, -27.485],
        "Upper Mount Gravatt": [153.078, -27.547],
        "Virginia": [153.055, -27.371],
        "Wavell Heights": [153.045, -27.385],
        "West End": [153.006, -27.485],
        "Wilston": [153.015, -27.437],
        "Windsor": [153.033, -27.432],
        "Woolloongabba": [153.035, -27.485],
        "Wooloowin": [153.045, -27.417],
        "Wynnum": [153.168, -27.442],
        "Zillmere": [153.045, -27.360]
    };

    useEffect(() => {
        // Initialize sources
        const suburbSource = new VectorSource();
        const locationSource = new VectorSource();
        vectorSourceRef.current = locationSource;

        // Add suburb features
        Object.entries(SUBURB_COORDINATES).forEach(([suburb, coords]) => {
            const feature = new Feature({
                geometry: new Point(fromLonLat(coords)),
                name: suburb,
                type: 'suburb'
            });
            suburbSource.addFeature(feature);
        });

        // Create cluster source
        const clusterSource = new Cluster({
            distance: 40,
            source: suburbSource,
            minDistance: 20
        });

        // Styles for different features
        const suburbStyle = new Style({
            image: new Circle({
                radius: 6,
                fill: new Fill({ color: 'rgba(66, 135, 245, 0.8)' }),
                stroke: new Stroke({ color: 'white', width: 1.5 })
            }),
            text: new Text({
                font: '12px Outfit',
                textAlign: 'left',
                textBaseline: 'middle',
                offsetX: 12,
                offsetY: 0,
                fill: new Fill({ color: '#374151' }),
                stroke: new Stroke({
                    color: 'white',
                    width: 3
                })
            })
        });

        const locationStyle = new Style({
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

        // Style function for clusters
        const styleFunction = (feature) => {
            const size = feature.get('features').length;
            if (size === 1) {
                // Single feature
                const actualFeature = feature.get('features')[0];
                const customStyle = suburbStyle.clone();
                customStyle.getText().setText(actualFeature.get('name'));
                return customStyle;
            }

            // Cluster of features
            return new Style({
                image: new Circle({
                    radius: Math.min(size * 3, 20),
                    fill: new Fill({ color: 'rgba(66, 135, 245, 0.8)' }),
                    stroke: new Stroke({ color: 'white', width: 2 })
                }),
                text: new Text({
                    text: size.toString(),
                    fill: new Fill({ color: 'white' }),
                    font: 'bold 12px Outfit'
                })
            });
        };

        // Create layers
        const clusterLayer = new VectorLayer({
            source: clusterSource,
            style: styleFunction,
            zIndex: 1
        });

        const locationLayer = new VectorLayer({
            source: locationSource,
            style: locationStyle,
            zIndex: 2
        });

        // Initialize map
        const map = new Map({
            target: mapRef.current,
            layers: [
                new TileLayer({ source: new OSM() }),
                clusterLayer,
                locationLayer
            ],
            view: new View({
                center: fromLonLat(BRISBANE_CENTER),
                zoom: ZOOM_LEVEL
            })
        });

        // Handle cluster clicks
        map.on('click', (event) => {
            const feature = map.forEachFeatureAtPixel(event.pixel, (feature) => feature);

            if (feature) {
                const features = feature.get('features');

                if (features && features.length > 1) {
                    // Cluster clicked
                    const extent = boundingExtent(
                        features.map(f => f.getGeometry().getCoordinates())
                    );
                    map.getView().fit(extent, {
                        duration: 1000,
                        padding: [50, 50, 50, 50],
                        easing: easeOut
                    });
                } else if (features && features.length === 1) {
                    // Single suburb clicked
                    const coords = features[0].getGeometry().getCoordinates();
                    map.getView().animate({
                        center: coords,
                        zoom: Math.max(map.getView().getZoom(), 14),
                        duration: 1000
                    });
                } else {
                    // Location marker clicked
                    const coords = feature.getGeometry().getCoordinates();
                    const properties = feature.getProperties();
                    if (properties.suburb && properties.street) {
                        overlayRef.current.setPosition(coords);
                        setSelectedLocation({
                            suburb: properties.suburb,
                            street: properties.street
                        });
                    }
                }
            } else {
                overlayRef.current.setPosition(undefined);
                setSelectedLocation(null);
            }
        });

        // Create and add popup overlay
        const overlay = new Overlay({
            element: popupRef.current,
            positioning: 'bottom-center',
            offset: [0, -10],
            autoPan: true,
            autoPanAnimation: { duration: 250 }
        });

        map.addOverlay(overlay);
        overlayRef.current = overlay;
        mapInstanceRef.current = map;

        return () => {
            map.setTarget(undefined);
        };
    }, [SUBURB_COORDINATES]);

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

                // Scroll to map on mobile
                if (window.innerWidth < 768) { // md breakpoint
                    const mapElement = document.getElementById('map');
                    if (mapElement) {
                        mapElement.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                }
            }
        } catch (error) {
            console.error('Error geocoding address:', error);
        }
    };
    // Map initialization and other functions remain the same...
    // (keeping all the existing map-related functionality)

    return (
        <div className="min-h-screen w-full bg-background">
            <div className="w-full min-h-screen relative">
                {/* Header */}
                <div className="fixed top-0 left-0 right-0 bg-background/80 backdrop-blur-xl z-20 border-b border-border">
                    <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6">
                        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                            <div className="flex-1 flex items-center gap-x-4">
                                <Link href="/">
                                    <Image src={icon} alt="alt" width={50} height={50} />
                                </Link>
                                <h1 className="text-sm sm:text-3xl font-semibold text-foreground font-outfit">
                                    Will & Lixey&apos;s Christmas Light Hunt
                                    <span className="block text-sm text-muted-foreground font-normal mt-0.5 font-outfit">
                                        Brisbane Edition
                                    </span>
                                </h1>
                            </div>
                            <div className="relative w-full sm:w-72">
                                <div className="absolute inset-0 bg-muted rounded-xl backdrop-blur-sm -z-10" />
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Search locations..."
                                    className="w-full pl-10 h-9 bg-muted border-0 rounded-xl text-sm font-outfit placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:bg-muted"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                    <Image src={candycaneGif} alt="alt" width={2000} height={2} className="h-2" />
                </div>

                {/* Main Content */}
                <div className="pt-24 px-4 sm:px-6">
                    {/* Carousel Section */}

                    <div className="w-full max-w-7xl mx-auto mb-8  h-[40vh] flex items-center flex-col justify-end ">
                        <h1 className="text-sm border p-4 my-4 rounded-full sm:text-3xl font-semibold text-foreground font-outfit">
                            Santa&apos;s Helpers
                        </h1>
                        <Carousel
                            className="w-full"
                            plugins={[plugin.current]}
                            opts={{
                                align: "start",
                                loop: true,
                            }}
                        >
                            <CarouselContent>
                                <CarouselItem>
                                    <div className="relative w-full h-[200px] sm:h-[300px] md:h-[400px] rounded-xl overflow-hidden">
                                        <Image
                                            src={christmas1}
                                            alt="Christmas Lights Display 1"
                                            fill
                                            className="object-contain"
                                            priority
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                                        />
                                    </div>
                                </CarouselItem>
                                <CarouselItem>
                                    <div className="relative w-full h-[200px] sm:h-[300px] md:h-[400px] rounded-xl overflow-hidden">
                                        <Image
                                            src={christmas2}
                                            alt="Christmas Lights Display 2"
                                            fill
                                            className="object-contain"
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                                        />
                                    </div>
                                </CarouselItem>
                                <CarouselItem>
                                    <div className="relative w-full h-[200px] sm:h-[300px] md:h-[400px] rounded-xl overflow-hidden">
                                        <Image
                                            src={christmas3}
                                            alt="Christmas Lights Display 3"
                                            fill
                                            className="object-contain"
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                                        />
                                    </div>
                                </CarouselItem>
                            </CarouselContent>
                            <div className="hidden sm:block">
                                <CarouselPrevious className="hidden sm:flex" />
                                <CarouselNext className="hidden sm:flex" />
                            </div>
                        </Carousel>
                    </div>

                    <div className="max-w-7xl mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            {/* Sidebar */}
                            <Accordion type="single" collapsible className="space-y-2">
                                <AccordionItem value="locations">
                                    <AccordionTrigger>
                                        <h1 className="text-muted-foreground text-2xl font-outfit">
                                            Locations
                                        </h1>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <div className="bg-card/70 backdrop-blur-xl rounded-2xl shadow-sm border border-border">
                                            <div className="p-4">
                                                <Accordion type="single" collapsible className="space-y-2">
                                                    {Object.entries(locations)
                                                        .filter(([suburb, streets]) => {
                                                            const search = searchTerm.toLowerCase();
                                                            return suburb.toLowerCase().includes(search) ||
                                                                streets.some(street => street.toLowerCase().includes(search));
                                                        })
                                                        .map(([suburb, streets]) => (
                                                            <AccordionItem key={suburb} value={suburb} className="border-b-0">
                                                                <AccordionTrigger className="py-2 hover:no-underline">
                                                                    <div className="flex items-center text-sm font-medium text-foreground">
                                                                        <MapPin className="h-4 w-4 mr-1.5 text-muted-foreground" />
                                                                        {suburb}
                                                                        <span className="ml-2 text-xs text-muted-foreground">
                                                                            {streets.length}
                                                                        </span>
                                                                    </div>
                                                                </AccordionTrigger>
                                                                <AccordionContent>
                                                                    <ul className="ml-6 space-y-1.5">
                                                                        {streets.map((street) => (
                                                                            <li
                                                                                key={street}
                                                                                onClick={() => handleStreetClick(suburb, street)}
                                                                                className={`text-sm cursor-pointer transition-all
                                                                ${selectedLocation?.street === street
                                                                                        ? 'text-primary font-medium'
                                                                                        : 'text-muted-foreground hover:text-foreground'
                                                                                    }`}
                                                                            >
                                                                                {selectedLocation?.street === street ? '📍' : '·'} {street}
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                </AccordionContent>
                                                            </AccordionItem>
                                                        ))}
                                                </Accordion>
                                            </div>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                            {/* Map */}
                            <div className="md:col-span-3">
                                <div className="bg-card/70 backdrop-blur-xl rounded-2xl shadow-sm border border-border overflow-hidden h-[50vh] md:h-[calc(100vh-8rem)]">
                                    <div ref={mapRef} className="w-full h-full" />
                                    <div
                                        ref={popupRef}
                                        className="absolute bg-card/90 backdrop-blur-xl p-4 rounded-2xl shadow-lg border border-border min-w-[240px] max-w-[90vw] md:max-w-[320px]"
                                    >
                                        {selectedLocation && (
                                            <div className="space-y-3">
                                                <div className="space-y-1">
                                                    <div className="font-medium text-foreground">
                                                        {selectedLocation.street}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {selectedLocation.suburb}
                                                    </div>
                                                </div>

                                                <a
                                                    href={`https://www.google.com/maps/search/?api=1&query=${selectedLocation.street}+${selectedLocation.suburb}+Brisbane+QLD`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center justify-center gap-2 text-sm bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-xl transition-colors w-full font-medium"
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
        </div >
    );
};

export default ChristmasLightsMap;