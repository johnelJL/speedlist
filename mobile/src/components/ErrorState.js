import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

export default function ErrorState({ message = 'Something went wrong', onRetry }) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{message}</Text>
      {onRetry ? (
        <Pressable onPress={onRetry} style={styles.button}>
          <Text style={styles.buttonText}>Retry</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 24,
    alignItems: 'center'
  },
  text: {
    color: colors.error,
    marginBottom: 12
  },
  button: {
    backgroundColor: colors.accent,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8
  },
  buttonText: {
    color: '#0a192f',
    fontWeight: '700'
  }
});
