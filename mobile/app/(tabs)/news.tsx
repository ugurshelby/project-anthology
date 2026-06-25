import { View, Text, TextInput, ActivityIndicator, RefreshControl } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useState, useMemo } from 'react';
import { queryKeys } from '../../lib/queryKeys';
import { fetchNews } from '../../lib/api';
import { NewsCard } from '../../components/news/NewsCard';
import { SegmentedControl } from '../../components/ui/SegmentedControl';
import { Divider } from '../../components/ui/Divider';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { getGlossaryTerms } from '../../lib/glossary';
import { NewsItem, GlossaryTerm } from '../../lib/types';

const NEWS_FILTERS = ['All', 'Technical', 'Race'] as const;
type NewsFilter = typeof NEWS_FILTERS[number];

export default function NewsScreen() {
  const [mainTab, setMainTab] = useState(0);
  const [newsFilter, setNewsFilter] = useState<NewsFilter>('All');
  const [search, setSearch] = useState('');

  const { data: news, isLoading, refetch, isFetching } = useQuery({
    queryKey: queryKeys.news(),
    queryFn: fetchNews,
  });

  const glossaryTerms = useMemo(() => {
    const all = getGlossaryTerms();
    if (!search) return all;
    return all.filter((t) => t.term.toLowerCase().includes(search.toLowerCase()));
  }, [search]);

  const filteredNews = useMemo(() => {
    if (!news) return [];
    if (newsFilter === 'All') return news;
    const map: Record<NewsFilter, string> = { All: '', Technical: 'technical', Race: 'race' };
    return news.filter((n) => n.category === map[newsFilter]);
  }, [news, newsFilter]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg }}>
      <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12, gap: 12 }}>
        <SegmentedControl
          options={['News', 'Glossary']}
          selectedIndex={mainTab}
          onChange={setMainTab}
        />
        {mainTab === 0 && (
          <SegmentedControl
            options={['All', 'Technical', 'Race']}
            selectedIndex={(NEWS_FILTERS as readonly string[]).indexOf(newsFilter)}
            onChange={(i) => setNewsFilter(NEWS_FILTERS[i])}
          />
        )}
        {mainTab === 1 && (
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search terms…"
            placeholderTextColor={Colors.textLow}
            style={[Typography.dataMono, {
              backgroundColor: Colors.surface,
              borderWidth: 1,
              borderColor: Colors.hairline,
              borderRadius: 6,
              paddingHorizontal: 12,
              paddingVertical: 10,
              color: Colors.textHi,
            }]}
          />
        )}
      </View>

      {mainTab === 0 ? (
        isLoading ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator color={Colors.apexRed} />
          </View>
        ) : (
          <FlashList
            data={filteredNews}
            keyExtractor={(item: NewsItem) => item.id}
            contentContainerStyle={{ paddingHorizontal: 20 }}
            refreshControl={
              <RefreshControl
                refreshing={isFetching}
                onRefresh={() => { void refetch(); }}
                tintColor={Colors.apexRed}
              />
            }
            ItemSeparatorComponent={Divider}
            renderItem={({ item }) => <NewsCard item={item} />}
          />
        )
      ) : (
        <FlashList
          data={glossaryTerms}
          keyExtractor={(item: GlossaryTerm) => item.term}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
          renderItem={({ item }) => (
            <View style={{ paddingVertical: 12 }}>
              <Text style={[Typography.cardTitle, { color: Colors.textHi }]}>{item.term}</Text>
              <Text style={[Typography.bodyMd, { marginTop: 4, color: Colors.textMid }]}>{item.definition}</Text>
              <Divider />
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}
