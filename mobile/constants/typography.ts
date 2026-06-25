import { StyleSheet } from 'react-native';

export const Typography = StyleSheet.create({
  hero: {
    fontFamily: 'BarlowCondensed_700Bold',
    fontSize: 64,
    lineHeight: 64,
    color: '#ffffff',
  },
  headline: {
    fontFamily: 'BarlowCondensed_600SemiBold',
    fontSize: 32,
    lineHeight: 36,
    color: '#ffffff',
  },
  cardTitle: {
    fontFamily: 'BarlowCondensed_600SemiBold',
    fontSize: 22,
    lineHeight: 26,
    color: '#ffffff',
  },
  bodyLg: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    lineHeight: 26,
    color: '#e6e6e6',
  },
  bodyMd: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    lineHeight: 24,
    color: '#e6e6e6',
  },
  dataMono: {
    fontFamily: 'JetBrainsMono_500Medium',
    fontSize: 13,
    lineHeight: 20,
    color: '#e6e6e6',
  },
  labelCaps: {
    fontFamily: 'JetBrainsMono_700Bold',
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: '#9a9a9a',
  },
});
