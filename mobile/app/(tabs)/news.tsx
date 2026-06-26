import { View, Text, TextInput, ActivityIndicator, RefreshControl } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
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
import { Svg, Path } from 'react-native-svg';

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
      {/* Header */}
      <LinearGradient
        colors={['rgba(255,24,1,0.08)', 'transparent']}
        style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16 }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
          <View style={{ width: 16, height: 2, backgroundColor: Colors.apexRed }} />
          <Text style={[Typography.labelCaps, { color: Colors.apexRed, fontSize: 10 }]}>
            {mainTab === 0 ? 'LATEST' : 'REFERENCE'}
          </Text>
        </View>
        <Text style={[Typography.hero, { fontSize: 44, lineHeight: 44 }]}>
          {mainTab === 0 ? 'INTEL' : 'GLOSSARY'}
        </Text>
      </LinearGradient>

      {/* Tabs */}
      <View style={{ paddingHorizontal: 20, paddingBottom: 10, gap: 10 }}>
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
          <View style={{
            flexDirection: 'row', alignItems: 'center', gap: 8,
            backgroundColor: Colors.surface,
            borderWidth: 1, borderColor: Colors.hairline, borderRadius: 6,
            paddingHorizontal: 12,
          }}>
            <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
              <Path d="M21 21L15 15M17 11C17 14.3137 14.3137 17 11 17C7.68629 17 5 14.3137 5 11C5 7.68629 7.68629 5 11 5C14.3137 5 17 7.68629 17 11Z" stroke={Colors.textLow} strokeWidth={1.8} strokeLinecap="round" />
            </Svg>
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search terms…"
              placeholderTextColor={Colors.textLow}
              style={[Typography.dataMono, {
                flex: 1,
                paddingVertical: 10,
                color: Colors.textHi,
                fontSize: 13,
              }]}
            />
          </View>
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
            <View style={{ paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.hairline }}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
                <View style={{ width: 3, height: 20, backgroundColor: Colors.apexRed, borderRadius: 2, marginTop: 2, flexShrink: 0 }} />
                <View style={{ flex: 1 }}>
                  <Text style={[Typography.cardTitle, { color: Colors.textHi, fontSize: 15, lineHeight: 20 }]}>
                    {item.term}
                  </Text>
                  <Text style={[Typography.bodyMd, { marginTop: 4, color: Colors.textMid, fontSize: 13, lineHeight: 20 }]}>
                    {item.definition}
                  </Text>
                  {item.category && (
                    <View style={{ marginTop: 6, alignSelf: 'flex-start', paddingHorizontal: 6, paddingVertical: 3, backgroundColor: Colors.surface, borderRadius: 3 }}>
                      <Text style={[Typography.labelCaps, { color: Colors.textLow, fontSize: 9 }]}>
                        {item.category.toUpperCase()}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}
