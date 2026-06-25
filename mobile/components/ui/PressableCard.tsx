import { Pressable, ViewProps } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { Colors } from '../../constants/colors';

interface PressableCardProps extends ViewProps {
  onPress?: () => void;
  raised?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function PressableCard({ onPress, raised, style, children, ...props }: PressableCardProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <AnimatedPressable
      onPressIn={() => {
        scale.value = withSpring(0.97, { duration: 120 });
        opacity.value = withSpring(0.85, { duration: 120 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { duration: 120 });
        opacity.value = withSpring(1, { duration: 120 });
      }}
      onPress={onPress}
      style={[
        animStyle,
        {
          backgroundColor: raised ? Colors.surfaceRaised : Colors.surface,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: Colors.hairline,
          padding: 16,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </AnimatedPressable>
  );
}
