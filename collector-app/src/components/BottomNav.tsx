import React from 'react';
import { Home, Package, TrendingUp, IndianRupee, User } from 'lucide-react';
import { NavTab } from '../types';

interface BottomNavProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  pendingLotsCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onSelectTab,
  pendingLotsCount = 0,
}) => {
  const tabs: { id: NavTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'lots', label: 'My Lots', icon: Package },
    { id: 'prices', label: 'Price Board', icon: TrendingUp },
    { id: 'earnings', label: 'Earnings', icon: IndianRupee },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <nav
      aria-label="Collector App Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 shadow-lg max-w-md mx-auto"
    >
      <div className="grid grid-cols-5 h-16 px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex flex-col items-center justify-center relative py-1 px-0.5 transition-colors touch-manipulation select-none ${
                isActive ? 'text-emerald-700 font-semibold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {isActive && (
                <span className="absolute top-0 w-8 h-1 bg-emerald-600 rounded-b-full" />
              )}
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-[1.8px]'}`} />
                {tab.id === 'lots' && pendingLotsCount > 0 && (
                  <span className="absolute -top-1 -right-2 bg-amber-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {pendingLotsCount}
                  </span>
                )}
              </div>
              <span className={`text-[11px] mt-1 tracking-tight leading-tight whitespace-nowrap ${isActive ? 'font-semibold' : 'font-medium'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
