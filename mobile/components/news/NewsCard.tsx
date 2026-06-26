import { View, Text, Pressable, Linking } from 'react-native';
import { Typography } from '../../constants/typography';
import { Colors } from '../../constants/colors';
import { NewsItem } from '../../lib/types';

interface NewsCardProps {
  item: NewsItem;
}

export function NewsCard({ item }: NewsCardProps) {
  const d = new Date(item.publishedAt);
  const isToday = d.toDateString() === new Date().toDateString();
  const timeLabel = isToday
    ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

  return (
    <Pressable
      onPress={() => Linking.openURL(item.url)}
      style={({ pressed }) => [
        { flexDirection: 'row', gap: 12, paddingVertical: 12, opacity: pressed ? 0.7 : 1 },
      ]}
    >
      <Text style={[Typography.dataMono, { color: Colors.textLow, width: 44 }]}>{timeLabel}</Text>
      <View style={{ flex: 1 }}>
        <Text style={[Typography.bodyMd, { color: Colors.textHi }]} numberOfLines={2}>{item.title}</Text>
        <Text style={[Typography.labelCaps, { marginTop: 4 }]}>{item.source}</Text>
      </View>
    </Pressable>
  );
}
