import React, { useState } from 'react';
import {
  MapPin,
  Navigation,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { CustomerLocation } from '../../types';
import { useToast } from '../ui/Toast';

interface LocationPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLocation: CustomerLocation;
  onLocationConfirmed: (loc: CustomerLocation, granted: boolean) => void;
}

const PRESET_ZONES: { name: string; lat: number; lng: number }[] = [
  { name: 'Indiranagar, Bengaluru', lat: 12.9784, lng: 77.6408 },
  { name: 'Koramangala 4th Block, Bengaluru', lat: 12.9345, lng: 77.6265 },
  { name: 'HSR Layout Sector 1, Bengaluru', lat: 12.9116, lng: 77.6389 },
  { name: 'Whitefield IT Corridor, Bengaluru', lat: 12.9698, lng: 77.7499 },
  { name: 'Malleshwaram 8th Cross, Bengaluru', lat: 13.0033, lng: 77.5692 },
  { name: 'Jayanagar 4th Block, Bengaluru', lat: 12.9298, lng: 77.5824 },
];

export const LocationPermissionModal: React.FC<LocationPermissionModalProps> = ({
  isOpen,
  onClose,
  currentLocation,
  onLocationConfirmed,
}) => {
  const { showToast } = useToast();
  const [isDetecting, setIsDetecting] = useState(false);
  const [selectedZone, setSelectedZone] = useState<string>(currentLocation.address);

  const handleRequestBrowserLocation = () => {
    setIsDetecting(true);

    if (!('geolocation' in navigator)) {
      showToast({
        type: 'warning',
        title: 'Geolocation Not Supported',
        message: 'Your browser does not support GPS. Defaulted to Indiranagar zone.',
      });
      setIsDetecting(false);
      onLocationConfirmed(currentLocation, false);
      onClose();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const detectedLoc: CustomerLocation = {
          address: 'Current Verified Location (GPS)',
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          radiusKm: 10,
        };
        setIsDetecting(false);
        onLocationConfirmed(detectedLoc, true);
        showToast({
          type: 'success',
          title: 'Location Verified',
          message: 'Dynamic 10 km service boundary anchored to your coordinates.',
        });
        onClose();
      },
      (error) => {
        setIsDetecting(false);
        console.warn('Geolocation access declined or unavailable:', error.message);
        showToast({
          type: 'info',
          title: 'Using Selected District',
          message: `GPS permission was not granted. Using ${selectedZone.split(',')[0]} as your 10 km center.`,
        });
        // Graceful fallback to currently selected preset
        const match = PRESET_ZONES.find((z) => z.name === selectedZone) || PRESET_ZONES[0];
        onLocationConfirmed(
          {
            address: match.name,
            lat: match.lat,
            lng: match.lng,
            radiusKm: 10,
          },
          false
        );
        onClose();
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  const handleSelectPreset = (zone: (typeof PRESET_ZONES)[0]) => {
    setSelectedZone(zone.name);
    onLocationConfirmed(
      {
        address: zone.name,
        lat: zone.lat,
        lng: zone.lng,
        radiusKm: 10,
      },
      true
    );
    showToast({
      type: 'success',
      title: 'Zone Selected',
      message: `Dynamic 10 km service radius set to ${zone.name.split(',')[0]}.`,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Location Permission"
      subtitle="Strict 10 km service zone boundary"
      size="md"
    >
      <div className="space-y-6">
        {/* Core Explanatory Rationale - MANDATORY REQUIREMENT */}
        <div className="p-4 rounded-2xl bg-[#0071E3]/5 border border-[#0071E3]/20 flex items-start space-x-3.5">
          <div className="w-9 h-9 rounded-xl bg-[#0071E3]/10 text-[#0071E3] flex items-center justify-center shrink-0 mt-0.5">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-[#111111] mb-1">
              Why WorkLink requires your location
            </h4>
            <p className="text-xs text-[#0071E3] font-medium leading-relaxed italic">
              &ldquo;WorkLink uses your location to find professionals who can actually reach you.&rdquo;
            </p>
          </div>
        </div>

        {/* Value Points */}
        <div className="space-y-3">
          <div className="flex items-start space-x-3 text-xs text-[#6E6E73]">
            <CheckCircle2 className="w-4 h-4 text-[#34C759] shrink-0 mt-0.5" />
            <span>
              <strong className="text-[#111111]">10 km Radius Enforcement:</strong> We filter out workers farther than 10 km so nobody cancels halfway or promises unrealistic arrival times.
            </span>
          </div>
          <div className="flex items-start space-x-3 text-xs text-[#6E6E73]">
            <CheckCircle2 className="w-4 h-4 text-[#34C759] shrink-0 mt-0.5" />
            <span>
              <strong className="text-[#111111]">Zero Surprise Travel Fees:</strong> Workers within 5 km have zero travel charges; 5–10 km travel rates are upfront and transparent.
            </span>
          </div>
          <div className="flex items-start space-x-3 text-xs text-[#6E6E73]">
            <ShieldCheck className="w-4 h-4 text-[#0071E3] shrink-0 mt-0.5" />
            <span>
              <strong className="text-[#111111]">Privacy Guaranteed:</strong> Coordinates are used strictly for proximity calculations. Your exact flat/house number is only shared upon confirmed booking.
            </span>
          </div>
        </div>

        {/* Action Button: Browser GPS */}
        <Button
          variant="primary"
          size="lg"
          fullWidth
          isLoading={isDetecting}
          onClick={handleRequestBrowserLocation}
          leftIcon={<Navigation className="w-4 h-4" />}
        >
          {isDetecting ? 'Detecting Your Location...' : 'Allow Current Location (GPS)'}
        </Button>

        {/* Alternative: Select Neighborhood Preset */}
        <div className="pt-3 border-t border-black/5">
          <p className="text-xs font-semibold text-[#111111] mb-2.5 flex items-center justify-between">
            <span>Or select your Bangalore district</span>
            <span className="text-[11px] font-normal text-[#86868B]">Preset Hubs</span>
          </p>
          <div className="grid grid-cols-2 gap-2">
            {PRESET_ZONES.map((zone) => {
              const isSelected = selectedZone === zone.name;
              return (
                <button
                  key={zone.name}
                  onClick={() => handleSelectPreset(zone)}
                  className={`px-3 py-2 text-left rounded-xl text-xs transition-all border ${
                    isSelected
                      ? 'bg-[#111111] text-white border-[#111111] shadow-xs'
                      : 'bg-[#F5F5F7] hover:bg-[#EBEBEF] text-[#111111] border-black/5'
                  }`}
                >
                  <span className="font-medium block truncate">{zone.name.split(',')[0]}</span>
                  <span
                    className={`text-[10px] block truncate ${
                      isSelected ? 'text-white/70' : 'text-[#86868B]'
                    }`}
                  >
                    10 km Service Zone
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </Modal>
  );
};
