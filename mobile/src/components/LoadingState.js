import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

export default function LoadingState({ message = 'Loading...' }) {
  return (
    <View style={styles.container}>
      <ActivityIndicator color={colors.accent} size="large" />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24
  },
  text: {
    marginTop: 8,
    color: colors.muted
  }
});
