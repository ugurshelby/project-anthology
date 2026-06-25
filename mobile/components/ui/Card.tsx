import { View, ViewProps } from 'react-native';
import { Colors } from '../../constants/colors';

interface CardProps extends ViewProps {
  raised?: boolean;
}

export function Card({ raised, style, children, ...props }: CardProps) {
  return (
    <View
      style={[
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
    </View>
  );
}
