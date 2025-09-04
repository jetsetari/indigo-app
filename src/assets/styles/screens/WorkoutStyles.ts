
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#000',
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  titleWrapper: {
    marginBottom: 24,
    paddingTop: 12,
  },
  section: {
    marginBottom: 32,
  },
  weekCalendar: {
    marginBottom: 16,
  },
  workoutCard: {
    backgroundColor: '#111',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    borderColor: '#333',
    borderWidth: 1,
  },
  planBlock: {
    width: '100%',
    marginBottom: 20,
    alignSelf: 'flex-start'
  },
  workoutImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  workoutTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  workoutSubtitle: {
    fontSize: 13,
    color: '#aaa',
  },
  workoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dayItem: {
    backgroundColor: '#111',
    padding: 14,
    marginBottom: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#333',
  },
  dayItemChecked: {
    borderColor: '#00ff99',
  },
  dayItemText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  dayItemSubtitle: {
    color: '#aaa',
    fontSize: 13,
  },
});
