import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const App = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>SKLADKA</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F172A',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F8FAFC',
  },
});
