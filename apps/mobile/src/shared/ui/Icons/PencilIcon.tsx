import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { colors } from '../theme';

export interface PencilIconProps {
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

export const PencilIcon: React.FC<PencilIconProps> = ({
  size = 16,
  color = colors.primary,
  style,
}) => {
  const scale = size / 16;

  return (
    <View
      style={[
        styles.container,
        { width: size, height: size },
        style,
      ]}
      accessibilityRole="image"
      accessibilityLabel="Edit"
    >
      <View
        style={[
          styles.rotatedWrapper,
          {
            width: 14 * scale,
            height: 14 * scale,
          },
        ]}
      >
        {/* Pencil body */}
        <View
          style={{
            width: 3.5 * scale,
            height: 8.5 * scale,
            backgroundColor: color,
            borderRadius: 0.8 * scale,
          }}
        />
        {/* Pencil tip */}
        <View
          style={{
            width: 0,
            height: 0,
            borderLeftWidth: 1.75 * scale,
            borderRightWidth: 1.75 * scale,
            borderTopWidth: 3.5 * scale,
            borderLeftColor: 'transparent',
            borderRightColor: 'transparent',
            borderTopColor: color,
            marginTop: 0.5 * scale,
          }}
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
  rotatedWrapper: {
    transform: [{ rotate: '45deg' }],
    alignItems: 'center',
    justifyContent: 'center',
  },
});
