// components/DonutChart.tsx
import * as React from "react";
import { View } from "react-native";
import Svg, { G, Circle } from "react-native-svg";

export type DonutDatum = { value: number; color?: string; label?: string };

type Props = {
  data: DonutDatum[];
  size?: number;
  strokeWidth?: number;
  accessibilityLabel?: string;
};

const PALETTE = ["#16A34A", "#0EA5E9", "#F59E0B", "#EF4444", "#8B5CF6", "#14B8A6", "#F97316"];

export default function DonutChart({ data, size = 180, strokeWidth = 18 }: Props) {
  const r = size / 2;
  const c = Math.PI * (size - strokeWidth);
  const total = Math.max(1, data.reduce((a, d) => a + (d.value || 0), 0));

  let acc = 0;
  return (
    <View accessible accessibilityLabel={"Donut chart: " + (data.map(d => d.label || "").join(", "))}>
      <Svg width={size} height={size}>
        <G rotation="-90" origin={`${r}, ${r}`}>
          {data.map((d, i) => {
            const v = d.value || 0;
            const frac = v / total;
            const dash = frac * c;
            const gap = c - dash;
            const color = d.color || PALETTE[i % PALETTE.length];
            const circle = (
              <Circle
                key={i}
                cx={r}
                cy={r}
                r={(size - strokeWidth) / 2}
                stroke={color}
                strokeWidth={strokeWidth}
                strokeDasharray={`${dash} ${gap}`}
                strokeLinecap="butt"
                fill="none"
                strokeDashoffset={-acc}
              />
            );
            acc += dash;
            return circle;
          })}
        </G>
      </Svg>
    </View>
  );
}
