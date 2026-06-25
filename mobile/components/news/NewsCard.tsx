import { View, Text, Pressable, Linking } from 'react-native';
import { Typography } from '../../constants/typography';
import { Colors } from '../../constants/colors';
import { NewsItem } from '../../lib/types';

interface NewsCardProps {
  item: NewsItem;
}

export function NewsCard({ item }: NewsCardProps) {
  const time = new Date(item.publishedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return (
    <Pressable
      onPress={() => Linking.openURL(item.url)}
      style={{ flexDirection: 'row', gap: 12, paddingVertical: 12 }}
    >
      <Text style={[Typography.dataMono, { color: Colors.textLow, width: 40 }]}>{time}</Text>
      <View style={{ flex: 1 }}>
        <Text style={[Typography.bodyMd, { color: Colors.textHi }]} numberOfLines={2}>{item.title}</Text>
        <Text style={[Typography.labelCaps, { marginTop: 4 }]}>{item.source}</Text>
      </View>
    </Pressable>
  );
}
