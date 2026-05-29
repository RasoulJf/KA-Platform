// src/Components/DynamicIcon.jsx
import * as Iconsax from 'iconsax-react';

const DynamicIcon = ({ name, size = 24, variant = "Outline", ...props }) => {
  if (!name) {
    const FallbackIcon = Iconsax.Gift;
    return <FallbackIcon size={size} variant={variant} {...props} />;
  }

  // Normalize name to PascalCase: "gift" → "Gift", "arrow-right" → "ArrowRight"
//   const normalizedName = name
//     .split(/[-_\s]+/)
//     .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
//     .join('');

  const IconComponent = Iconsax[name] || Iconsax.Gift;
  console.log(IconComponent)

  return <IconComponent size={size}  color="#d9e3f0"
  variant={variant} {...props} />;
};

export default DynamicIcon;