import { Dimensions, StyleSheet } from 'react-native';

const { width } = Dimensions.get('window');
export const ITEM_WIDTH = 20;
export const H_PADDING = (width - ITEM_WIDTH) / 2;

export const styles = StyleSheet.create({
  wrapper: {
    paddingVertical: 40,
    alignItems: 'center',
    backgroundColor: '#000',
    maxHeight: 150,
    marginBottom: 30,
  },
  label: {
    color: '#FFF',
    fontSize: 16,
    marginBottom: 20,
    fontFamily: 'Inter-SemiBold',
    alignSelf: 'flex-start',
    paddingHorizontal: 20,
  },
  scaleWrapper: { position: 'relative' },
  item: {
    width: ITEM_WIDTH,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  tick: { width: 2, backgroundColor: '#888', height: 20 },
  longTick: { height: 30, backgroundColor: '#FFF' },
  shortTick: { height: 15 },
  tickLabel: {
    marginTop: 4,
    color: '#FFF',
    fontSize: 12,
    fontFamily: 'Inter-Light',
  },
  centerIndicator: {
    position: 'absolute',
    top: 0,
    bottom: 30,
    left: width / 2 - 1,
    width: 2,
    backgroundColor: '#FFF',
  },
  valueDisplay: {
    marginTop: -20,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  valueNumber: { fontSize: 32, fontWeight: 'bold', color: '#FFF' },
  valueUnit: { fontSize: 18, color: '#FFF', marginLeft: 4, fontFamily: 'Inter-Light' },
});
