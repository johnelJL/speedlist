import React, { useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import Card from '../components/Card';
import ErrorState from '../components/ErrorState';
import ListItem from '../components/ListItem';
import LoadingState from '../components/LoadingState';
import SearchBar from '../components/SearchBar';
import { useCategoryItems } from '../api/hooks';
import { colors } from '../theme/colors';

export default function CategoryScreen({ route, navigation }) {
  const { category } = route.params || {};
  const [search, setSearch] = useState('');
  const { data, isLoading, isError, refetch, isRefetching } = useCategoryItems(category?.name, search);

  const header = useMemo(
    () => (
      <View style={styles.header}>
        <Text style={styles.title}>{category?.name}</Text>
        <Text style={styles.subtitle}>{category?.subcategories?.join(' • ')}</Text>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Search in this category" />
      </View>
    ),
    [category?.name, category?.subcategories, search]
  );

  if (isLoading) {
    return <LoadingState message="Loading category" />;
  }

  if (isError) {
    return <ErrorState message="Could not load items" onRetry={refetch} />;
  }

  return (
    <FlatList
      data={data || []}
      keyExtractor={(item) => String(item.id || item.title)}
      ListHeaderComponent={header}
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.accent} />}
      renderItem={({ item }) => (
        <Card style={styles.card}>
          <ListItem
            title={item.title || item.name}
            subtitle={item.description}
            meta={item.price ? `${item.price} €` : undefined}
            onPress={() => navigation.navigate('ItemDetail', { id: item.id })}
          />
        </Card>
      )}
      ListEmptyComponent={<Text style={styles.empty}>No listings found here yet.</Text>}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    paddingBottom: 24
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: colors.background
  },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800'
  },
  subtitle: {
    color: colors.muted,
    marginTop: 4,
    marginBottom: 12
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 12
  },
  empty: {
    color: colors.muted,
    paddingHorizontal: 16,
    paddingVertical: 20
  }
});
