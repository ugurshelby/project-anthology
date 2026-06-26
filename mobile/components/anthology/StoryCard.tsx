import { View, Text } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { PressableCard } from '../ui/PressableCard';
import { Typography } from '../../constants/typography';
import { Colors } from '../../constants/colors';
import { Story } from '../../lib/types';

export function StoryCard({ story, onPress }: { story: Story; onPress: () => void }) {
  const dateStr = new Date(story.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <PressableCard onPress={onPress} style={{ padding: 0, overflow: 'hidden', marginBottom: 20 }}>
      <View style={{ height: 240 }}>
        <Image
          source={story.coverImageUrl ? { uri: story.coverImageUrl } : undefined}
          style={{ width: '100%', height: '100%' }}
          contentFit="cover"
          placeholder={{ blurhash: 'LKO2?U%2Tw=w]~RBVZRi};RPxuwH' }}
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.92)']}
          locations={[0.3, 0.6, 1]}
          style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 160 }}
        />
        <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, gap: 4 }}>
          {story.kicker && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View style={{ width: 16, height: 2, backgroundColor: Colors.apexRed }} />
              <Text style={[Typography.labelCaps, { color: Colors.apexRed, fontSize: 10 }]}>{story.kicker}</Text>
            </View>
          )}
          <Text style={[Typography.cardTitle, { color: Colors.textHi, fontSize: 20, lineHeight: 24 }]} numberOfLines={2}>
            {story.title}
          </Text>
          {story.excerpt && (
            <Text style={[Typography.bodyMd, { color: 'rgba(255,255,255,0.65)', fontSize: 13, lineHeight: 18 }]} numberOfLines={2}>
              {story.excerpt}
            </Text>
          )}
          <Text style={[Typography.labelCaps, { color: Colors.textLow, marginTop: 4, fontSize: 10 }]}>{dateStr}</Text>
        </View>
      </View>
    </PressableCard>
  );
}
