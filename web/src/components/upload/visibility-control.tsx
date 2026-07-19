'use client';

import { Globe, Users, Lock, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Visibility } from '@/types';

interface VisibilityControlProps {
  visibility: Visibility;
  onVisibilityChange: (visibility: Visibility) => void;
}

const visibilityOptions: { value: Visibility; label: string; description: string; icon: React.ElementType }[] = [
  {
    value: 'PUBLIC',
    label: '公开',
    description: '所有人可见',
    icon: Globe,
  },
  {
    value: 'FOLLOWERS',
    label: '关注者',
    description: '仅关注者可见',
    icon: Users,
  },
  {
    value: 'PRIVATE',
    label: '私密',
    description: '仅自己可见',
    icon: Lock,
  },
];

export function VisibilityControl({
  visibility,
  onVisibilityChange,
}: VisibilityControlProps) {
  const currentOption = visibilityOptions.find((o) => o.value === visibility) || visibilityOptions[0];
  const Icon = currentOption.icon;

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">可见性</label>
      <div className="flex gap-2">
        {visibilityOptions.map((option) => {
          const OptionIcon = option.icon;
          const isActive = visibility === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onVisibilityChange(option.value)}
              className={cn(
                'flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              )}
            >
              <OptionIcon className="h-4 w-4" />
              <span>{option.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
