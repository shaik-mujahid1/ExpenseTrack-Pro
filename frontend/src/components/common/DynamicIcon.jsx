import React from 'react';
import * as Icons from 'lucide-react';

export const DynamicIcon = ({ name, className = 'w-5 h-5', color = null }) => {
  const IconComponent = Icons[name] || Icons.Tag || Icons.HelpCircle;
  return <IconComponent className={className} style={color ? { color } : undefined} />;
};
