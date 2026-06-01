import React from 'react';
import * as Icons from 'lucide-react';

export default function LucideIcon({ name, className = '', size = 20 }) {
  // Try to find the icon component in Lucide package
  const IconComponent = Icons[name];
  
  if (!IconComponent) {
    // Return standard Gamepad2 icon as a generic default
    const DefaultIcon = Icons.Gamepad2;
    return <DefaultIcon className={className} size={size} />;
  }
  
  return <IconComponent className={className} size={size} />;
}
