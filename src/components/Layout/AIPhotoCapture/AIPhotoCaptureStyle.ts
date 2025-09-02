import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 30
  },
  camera: {
    width: '100%',
    flex: 1,
    backgroundColor: '#000',
  },
  frame: {
    position: 'absolute',
    top: 80,
    left: 40,
    right: 40,
    height: 300,
    borderWidth: 0,
    //borderColor: '#FFF',
    borderRadius: 4,
    zIndex: 10,
  },
  captureBtn: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: 12,
    borderRadius: 0,
    borderColor: '#FFF',
    borderWidth: 2,
    zIndex: 555,
    height: 70,
    width: 70,
    justifyContent: 'center',
    alignItems: 'center'
  },
  toggleBtn: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderColor: '#FFF',
    borderWidth: 2,
    padding: 15,
    borderRadius: 0,
    zIndex: 2,
  },

  retakeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  title: {
    marginTop: 16,
    fontSize: 16,
    color: '#FFF',
    fontFamily: 'Inter-Bold',
    position: 'absolute',
    bottom: 25
  },
  tips: {
    marginTop: 10,
    paddingHorizontal: 20,
  },
  tip: {
    fontSize: 13,
    color: '#FFF',
    marginVertical: 2,
  },
  thumbs: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    gap: 10,
    position: 'absolute',
    bottom: 60
  },
  thumb: {
    width: 80,
    height: 80,
    backgroundColor: '#444',
  },
  activeThumb: {
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  permissionWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    padding: 20,
  },
  permissionText: {
    color: '#FFF',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
  },
  permissionButtonText: {
    color: '#000',
    fontWeight: 'bold',
  },
});