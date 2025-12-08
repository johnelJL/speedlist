import React, { useRef } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Card from '../components/Card';
import ErrorState from '../components/ErrorState';
import LoadingState from '../components/LoadingState';
import ListItem from '../components/ListItem';
import { useCategories } from '../api/hooks';
import { colors } from '../theme/colors';

export default function HomeScreen({ navigation }) {
  const { data, isLoading, isError, fetchNextPage, hasNextPage, refetch, isFetchingNextPage } =
    useCategories();

  const listRef = useRef(null);

  const categories = data?.pages.flatMap((page) => page.items) || [];

  if (isLoading) {
    return <LoadingState message="Loading categories" />;
  }

  if (isError) {
    return <ErrorState message="Could not load categories" onRetry={refetch} />;
  }

  const handleLoadMore = async () => {
    await fetchNextPage();
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  return (
    <FlatList
      ref={listRef}
      contentContainerStyle={styles.container}
      data={categories}
      keyExtractor={(item) => item.name}
      refreshControl={<RefreshControl refreshing={false} onRefresh={refetch} tintColor={colors.accent} />}
      renderItem={({ item }) => (
        <Card style={styles.card}>
          <ListItem
            title={item.name}
            subtitle={`${item.subcategories?.length || 0} subcategories`}
            onPress={() => navigation.navigate('CategoryDetail', { category: item })}
          />
        </Card>
      )}
      ListFooterComponent={
        hasNextPage ? (
          <View style={styles.footer}>
            <TouchableOpacity style={styles.button} onPress={handleLoadMore} disabled={isFetchingNextPage}>
              <Text style={styles.buttonText}>{isFetchingNextPage ? 'Loading…' : 'Load more'}</Text>
            </TouchableOpacity>
          </View>
        ) : null
      }
    />
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    padding: 16,
    gap: 12
  },
  card: {
    marginBottom: 8
  },
  footer: {
    paddingVertical: 16,
    alignItems: 'center'
  },
  button: {
    backgroundColor: colors.accent,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10
  },
  buttonText: {
    color: '#0a192f',
    fontWeight: '700'
  }
});
