import React from 'react';

export default function NavigationItem({ icon: Icon, label, isActive = false }: { icon: React.ElementType, label: string, isActive?: boolean }) {
  
    return (
    <button className="flex flex-col items-center justify-center flex-1">
      <Icon className={`w-6 h-6 ${isActive ? 'text-black' : 'text-gray-400'}`} />
      <span className={`text-xs mt-1 ${isActive ? 'text-black' : 'text-gray-400'}`}>{label}</span>
    </button>
  );
}

