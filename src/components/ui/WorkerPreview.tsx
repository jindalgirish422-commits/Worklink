import React from 'react';
import { Star, MapPin } from 'lucide-react';
import { Worker } from '../../types';
import { Avatar } from './Avatar';
import { Badge } from './Badge';
import { MatchScore } from './MatchScore';
import { Status } from './Status';

export interface WorkerPreviewProps {
  worker: Worker;
  matchScore?: number;
  onClick?: () => void;
  isCompact?: boolean;
  className?: string;
}

export const WorkerPreview: React.FC<WorkerPreviewProps> = ({
  worker,
  matchScore,
  onClick,
  isCompact = false,
  className = '',
}) => {
  const isFreeTravel = worker.distanceKm <= 5.0;

  if (isCompact) {
    return (
      <div
        onClick={onClick}
        className={`flex items-center justify-between p-3 bg-[#FFFFFF] border border-black/5 hover:border-black/15 rounded-2xl transition-all ${
          onClick ? 'cursor-pointer hover:shadow-xs' : ''
        } ${className}`}
      >
        <div className="flex items-center space-x-3 min-w-0">
          <Avatar
            src={worker.avatar}
            alt={worker.name}
            size="sm"
            isVerified={worker.isVerified}
          />
          <div className="min-w-0">
            <p className="text-xs font-bold text-[#111111] truncate tracking-tight">
              {worker.name}
            </p>
            <p className="text-[11px] text-[#6E6E73] truncate">
              {worker.trade} • {worker.distanceKm.toFixed(1)} km
            </p>
          </div>
        </div>

        {typeof matchScore === 'number' && (
          <MatchScore score={matchScore} size="sm" />
        )}
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`card-premium p-5 flex flex-col justify-between ${
        onClick ? 'cursor-pointer hover:shadow-md' : ''
      } ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start space-x-3.5">
          <Avatar
            src={worker.avatar}
            alt={worker.name}
            size="lg"
            isVerified={worker.isVerified}
          />
          <div>
            <div className="flex items-center space-x-1.5">
              <h4 className="text-sm font-bold text-[#111111] tracking-tight">
                {worker.name}
              </h4>
              <span className="text-[11px] font-mono text-[#86868B]">({worker.id})</span>
            </div>
            <p className="text-xs text-[#6E6E73] mt-0.5">
              {worker.trade} • {worker.experienceYears}y Exp
            </p>

            <div className="flex items-center gap-2 mt-2 text-xs">
              <span className="flex items-center font-bold text-[#111111]">
                <Star className="w-3.5 h-3.5 text-[#FF9500] fill-[#FF9500] mr-1" />
                {worker.rating.toFixed(1)}
              </span>
              <span className="text-[#86868B]">•</span>
              <span className="flex items-center text-[#6E6E73]">
                <MapPin className="w-3 h-3 text-[#86868B] mr-1" />
                {worker.distanceKm.toFixed(1)} km
              </span>
            </div>
          </div>
        </div>

        {typeof matchScore === 'number' && (
          <MatchScore score={matchScore} size="md" />
        )}
      </div>

      <div className="flex items-center justify-between pt-4 mt-4 border-t border-black/5 text-xs">
        <Status type={worker.availabilityStatus} />
        <span className="font-bold text-[#111111]">
          ₹{worker.estimatedQuote}
          <span className="text-[11px] text-[#86868B] font-normal ml-0.5">est</span>
        </span>
      </div>
    </div>
  );
};
