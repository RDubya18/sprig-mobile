// components/Skeleton.tsx
import * as React from "react";
import { Animated, Easing, StyleSheet, ViewStyle } from "react-native";
import { colors } from "../lib/colors";

type BaseProps = {
  width?: number | `${number}%`;
  height?: number;
  radius?: number;
  style?: ViewStyle | ViewStyle[];
};

export default function Skeleton({ width = "100%", height = 12, radius = 8, style }: BaseProps) {
  const opacity = React.useRef(new Animated.Value(0.6)).current;
  React.useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.6, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    loop.start(); return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.base,
        { width: width as any, height, borderRadius: radius, opacity, backgroundColor: "#E9EEF5", borderColor: colors.border },
        style as any,
      ]}
    />
  );
}

Skeleton.Line = function Line(props: BaseProps) {
  return <Skeleton {...props} height={props.height ?? 12} radius={props.radius ?? 6} />;
};
Skeleton.Block = function Block(props: BaseProps) {
  return <Skeleton {...props} height={props.height ?? 16} radius={props.radius ?? 10} />;
};

const styles = StyleSheet.create({
  base: { borderWidth: StyleSheet.hairlineWidth },
});
