import { View } from 'react-native';
import { Colors } from '../../constants/colors';

export function Divider() {
  return <View style={{ height: 1, backgroundColor: Colors.hairline, marginVertical: 8 }} />;
}
