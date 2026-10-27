import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { colors } from '../theme';

export interface SettingsIconProps {
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

export const SettingsIcon: React.FC<SettingsIconProps> = ({
  size = 18,
  color = colors.textPrimary,
  style,
}) => {
  const scale = size / 18;

  return (
    <View
      style={[
        styles.container,
        { width: size, height: size },
        style,
      ]}
      accessibilityRole="image"
      accessibilityLabel="Settings"
    >
      <View style={[styles.trackRow, { height: 2 * scale, marginBottom: 3 * scale }]}>
        <View style={[styles.bar, { backgroundColor: color }]} />
        <View
          style={[
            styles.knob,
            {
              left: 2 * scale,
              width: 5 * scale,
              height: 5 * scale,
              borderRadius: 2.5 * scale,
              top: -1.5 * scale,
              backgroundColor: color,
            },
          ]}
        />
      </View>

      <View style={[styles.trackRow, { height: 2 * scale, marginBottom: 3 * scale }]}>
        <View style={[styles.bar, { backgroundColor: color }]} />
        <View
          style={[
            styles.knob,
            {
              left: 10 * scale,
              width: 5 * scale,
              height: 5 * scale,
              borderRadius: 2.5 * scale,
              top: -1.5 * scale,
              backgroundColor: color,
            },
          ]}
        />
      </View>

      <View style={[styles.trackRow, { height: 2 * scale }]}>
        <View style={[styles.bar, { backgroundColor: color }]} />
        <View
          style={[
            styles.knob,
            {
              left: 5 * scale,
              width: 5 * scale,
              height: 5 * scale,
              borderRadius: 2.5 * scale,
              top: -1.5 * scale,
              backgroundColor: color,
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  trackRow: {
    width: '100%',
    position: 'relative',
    justifyContent: 'center',
  },
  bar: {
    width: '100%',
    height: '100%',
    borderRadius: 1,
    opacity: 0.5,
  },
  knob: {
    position: 'absolute',
  },
});
