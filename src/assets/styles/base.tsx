import { StyleSheet, Dimensions } from 'react-native';
const { width, height } = Dimensions.get('window');

export default StyleSheet.create({
  mainWrapper: { 
    position: 'absolute',  zIndex: 50000,  left: 0,  right: 0 
  },

  //CONTAINERS
  container: {
    flex: 1, backgroundColor: '#000000', paddingTop: 50, 
    paddingHorizontal: 20, paddingBottom: 0
  },
  contentCenter: { 
    flex: 1, justifyContent: 'center', alignItems: 'center'
  },
  contentCenterLogo: { 
    flex: 1, alignContent: 'center', justifyContent: 'center',
    paddingTop: 50
  },
  contentCenterBottom: { 
    width: '100%', marginBottom: 50, marginTop: 20, gap: 5, flexDirection: 'column'
  },
  contentCenterTop: {
    height: 40, width: '100%', marginTop: 30
  },

  space: {
    width: '100%', height: 10
  },
  footerSpace: {
    width: '100%', height: 100
  },
  divider: {
    width: '100%', height: 1, marginVertical: 15, backgroundColor: '#FFF'
  },
  text: {
    fontSize: 18, fontFamily: 'Inter-Light', color: '#FFF',
  },
  textSubline: {
    fontSize: 16, fontFamily: 'Inter-Light', color: '#FFF', marginBottom: 10
  },
  textCenter: {
    textAlign: 'center'
  },
  textBold: {
    fontSize: 18, fontFamily: 'Inter-Bold', color: '#FFF',
  },
  link: {
    color: '#888', fontSize: 13, textDecorationLine: 'underline',
  },
  textUnderline: {
    textDecorationLine: 'underline'
  },
  footerLink: {
    fontSize: 14, fontFamily: 'Inter-Light', color: '#FFF', marginBottom: 10,
    textDecorationLine: 'underline', marginLeft: 'auto'
  },

  rowGap: { 
    justifyContent: 'space-between', flexDirection: 'row', alignItems: 'flex-end', gap: 10,
  },

  headerWithExtra: {
    flexDirection: 'row', alignItems: 'center',
    marginBottom: 40
  },
  
  sublineMargin : {
    fontFamily: 'Inter-Light', fontSize: 18,
    color: '#FFF', marginBottom: 10, width: '100%'
  },



  infoBox: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111',
    borderRadius: 0,
    paddingVertical: 20,
    marginBottom: 20,
    padding: 10,
  },
  infoBoxColumn: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center'
  },
  infoBoxIcon: {
    marginBottom: 10
  },
  infoBoxValue: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoBoxLabel: {
    color: '#EEE',
    fontSize: 14,
    marginTop: 4,
    fontFamily: 'Inter-Regular',
  },
  
  
})