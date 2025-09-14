import * as React from "react";
import Svg, { Path, Rect, Circle } from "react-native-svg";

type IconProps = { size?: number; color?: string };

/** Sprig app tile (rounded square + sprout) */
export const SprigLogoTile: React.FC<IconProps> = ({ size = 36, color = "#1E7A4F" }) => (
  <Svg width={size} height={size} viewBox="0 0 48 48">
    <Rect x={0} y={0} width={48} height={48} rx={10} fill={color} />
    <Path d="M15 29h18l-2 8H17l-2-8Z" fill="#B77143" />
    <Path d="M24 12c-4.6.5-7.4 4.3-7.7 7.6 3.6.2 6.4-1.3 7.7-4 1.3 2.7 4.1 4.2 7.7 4-.3-3.3-3.1-7.1-7.7-7.6Z" fill="#83B38F" />
    <Path d="M23.4 17.8c-.7 3.1-2.9 5.3-6.6 6.2 2-2.8 3.6-4.7 6.6-6.2Z" fill="#2F7A51" />
    <Path d="M24.6 17.8c.7 3.1 2.9 5.3 6.6 6.2-2-2.8-3.6-4.7-6.6-6.2Z" fill="#2F7A51" />
  </Svg>
);

export const BellIcon: React.FC<IconProps & { dot?: boolean }> = ({
  size = 28,
  color = "#1F2C23",
  dot,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M12 3a5 5 0 0 0-5 5v2.1c0 .5-.2 1-.6 1.4L5 13.7c-.6.6-.2 1.6.6 1.6h12.8c.8 0 1.2-1 .6-1.6l-1.4-2.2a2 2 0 0 1-.3-1V8a5 5 0 0 0-5-5Z"
      fill="none"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path d="M9.5 18a2.5 2.5 0 0 0 5 0" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    {dot ? <Circle cx={18.5} cy={5.5} r={3} fill="#B91C1C" /> : null}
  </Svg>
);

export const GearIcon: React.FC<IconProps> = ({ size = 28, color = "#1F2C23" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M12 8.5a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7Zm8.5 3.5-.9 1.6 1.2 2.1-1.9 1.9-2.1-1.2-1.6.9-.3 2.4H9.1l-.3-2.4-1.6-.9-2.1 1.2L3.2 15.7l1.2-2.1-.9-1.6-2.4-.3V9.1l2.4-.3.9-1.6L3.2 5.1 5.1 3.2l2.1 1.2 1.6-.9.3-2.4h4.8l.3 2.4 1.6.9 2.1-1.2 1.9 1.9-1.2 2.1.9 1.6 2.4.3v4.8l-2.4.3Z"
      fill="none"
      stroke={color}
      strokeWidth={1.2}
      strokeLinejoin="round"
    />
  </Svg>
);
