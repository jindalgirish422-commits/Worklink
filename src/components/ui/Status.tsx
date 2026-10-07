import React from 'react';

export type StatusType =
  | 'immediate'
  | 'today'
  | 'tomorrow'
  | 'busy'
  | 'en_route'
  | 'in_progress'
  | 'completed'
  | 'verified'
  | 'unverified';

export interface StatusProps {
  type: StatusType;
  label?: string;
  className?: string;
}

export const Status: React.FC<StatusProps> = ({ type, label, className = '' }) => {
  const configs: Record<
    StatusType,
    { dotColor: string; defaultLabel: string; textColor: string; ping?: boolean }
  > = {
    immediate: {
      dotColor: 'bg-[#34C759]',
      defaultLabel: 'Available Now',
      textColor: 'text-[#1B8738]',
      ping: true,
    },
    today: {
      dotColor: 'bg-[#0071E3]',
      defaultLabel: 'Available Today',
      textColor: 'text-[#0071E3]',
    },
    tomorrow: {
      dotColor: 'bg-[#FF9500]',
      defaultLabel: 'Booked Today (Next Slot: Tomorrow)',
      textColor: 'text-[#B25E00]',
    },
    busy: {
      dotColor: 'bg-[#86868B]',
      defaultLabel: 'Currently Unavailable',
      textColor: 'text-[#6E6E73]',
    },
    en_route: {
      dotColor: 'bg-[#0071E3]',
      defaultLabel: 'En Route',
      textColor: 'text-[#0071E3]',
      ping: true,
    },
    in_progress: {
      dotColor: 'bg-[#34C759]',
      defaultLabel: 'In Progress',
      textColor: 'text-[#1B8738]',
      ping: true,
    },
    completed: {
      dotColor: 'bg-[#34C759]',
      defaultLabel: 'Completed',
      textColor: 'text-[#1B8738]',
    },
    verified: {
      dotColor: 'bg-[#0071E3]',
      defaultLabel: 'Verified Pro',
      textColor: 'text-[#0071E3]',
    },
    unverified: {
      dotColor: 'bg-[#FF3B30]',
      defaultLabel: 'Unverified',
      textColor: 'text-[#D70015]',
    },
  };

  const config = configs[type] || configs.immediate;
  const displayLabel = label || config.defaultLabel;

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${config.textColor} ${className}`}>
      <span className="relative flex h-2 w-2">
        {config.ping && (
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${config.dotColor}`}
          />
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${config.dotColor}`} />
      </span>
      <span>{displayLabel}</span>
    </span>
  );
};
