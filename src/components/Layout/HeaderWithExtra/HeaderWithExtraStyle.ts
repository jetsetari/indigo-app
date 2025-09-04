import { StyleSheet, Dimensions } from 'react-native';
const { width, height } = Dimensions.get('window');

export const styles = StyleSheet.create({
  headerWithExtra: {
    flexDirection: 'row', alignItems: 'center',
    marginBottom: 30, justifyContent: 'space-between'
  },
  headerWithExtraWrapper: {
    flex: 1, minWidth: 0, marginRight: 12, gap: 10
  }
});