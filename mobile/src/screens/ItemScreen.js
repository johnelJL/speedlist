import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Card from '../components/Card';
import ErrorState from '../components/ErrorState';
import LoadingState from '../components/LoadingState';
import { useAd } from '../api/hooks';
import { colors } from '../theme/colors';

export default function ItemScreen({ route }) {
  const { id } = route.params || {};
  const { data, isLoading, isError, refetch } = useAd(id);

  if (isLoading) {
    return <LoadingState message="Loading item" />;
  }

  if (isError || !data) {
    return <ErrorState message="Item not available" onRetry={refetch} />;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card>
        <Text style={styles.title}>{data.title}</Text>
        <Text style={styles.meta}>{data.category}</Text>
        <Text style={styles.description}>{data.description}</Text>
        <View style={styles.metrics}>
          {data.location ? <Text style={styles.metric}>📍 {data.location}</Text> : null}
          {data.price ? <Text style={styles.metric}>💶 {data.price}</Text> : null}
          {Number.isFinite(data.visits) ? <Text style={styles.metric}>👁️ {data.visits} views</Text> : null}
        </View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    flex: 1
  },
  content: {
    padding: 16
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 8
  },
  meta: {
    color: colors.muted,
    marginBottom: 12
  },
  description: {
    color: colors.text,
    lineHeight: 20
  },
  metrics: {
    marginTop: 16,
    gap: 6
  },
  metric: {
    color: colors.accent,
    fontWeight: '700'
  }
});
