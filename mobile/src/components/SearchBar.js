import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { colors } from '../theme/colors';

export default function SearchBar({ value, onChangeText, placeholder = 'Search' }) {
  return (
    <View style={styles.container}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        style={styles.input}
        autoCorrect={false}
        autoCapitalize="none"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12
  },
  input: {
    color: colors.text,
    fontSize: 16
  }
});
