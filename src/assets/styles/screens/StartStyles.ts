import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  welcome: {
    color: '#FFF',
    fontSize: 16,
  },
  name: {
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#AAA',
    fontSize: 14,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },

  // Stats
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#111',
    borderRadius: 0,
    paddingVertical: 15,
    marginBottom: 20,
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#777',
    fontSize: 12,
    marginTop: 4,
  },

  // Sections
  section: {
    marginBottom: 30,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  link: {
    color: '#888',
    fontSize: 13,
    textDecorationLine: 'underline',
  },

  // Workout List
  workoutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111',
    borderRadius: 6,
    marginBottom: 8,
    padding: 10,
  },
  workoutImage: {
    width: 40,
    height: 40,
    marginRight: 12,
    borderRadius: 6,
  },
  workoutText: {
    color: '#FFF',
    fontSize: 14,
  },

  startButton: {
    marginTop: 10,
    backgroundColor: '#00FFB0',
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },

  // Achievements
  achievementsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  badge: {
    width: 80,
    height: 80,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },

  // Progress Boxes
  progressBox: {
    backgroundColor: '#111',
    padding: 12,
    borderRadius: 6,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  // Info Box
  infoBox: {
    backgroundColor: '#111',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 6,
    marginBottom: 10,
    gap: 10,
  },
  infoBig: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoSmall: {
    color: '#777',
    fontSize: 13,
  },

  // Bottom Navigation
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#222',
    backgroundColor: '#FFF',
    marginTop: 20,
  },
  navIcon: {
    alignItems: 'center',
  },
});
