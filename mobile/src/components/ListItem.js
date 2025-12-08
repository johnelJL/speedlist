import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

export default function ListItem({ title, subtitle, meta, onPress }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.container, pressed && styles.pressed]}>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {meta ? <Text style={styles.meta}>{meta}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    paddingHorizontal: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  pressed: {
    opacity: 0.8
  },
  textContainer: {
    flex: 1,
    paddingRight: 8
  },
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700'
  },
  subtitle: {
    color: colors.muted,
    fontSize: 14,
    marginTop: 4
  },
  meta: {
    color: colors.accent,
    fontWeight: '600'
  }
});
