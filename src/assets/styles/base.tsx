import { StyleSheet, Dimensions } from 'react-native';

export default StyleSheet.create({
  mainWrapper: { 
    position: 'absolute',  zIndex: 50000,  left: 0,  right: 0 
  },

  //CONTAINERS
  container: {
    flex: 1, backgroundColor: '#000000', paddingTop: 50, 
    paddingHorizontal: 10, paddingBottom: 0
  },
  contentCenter: { 
    flex: 1, justifyContent: 'center', alignItems: 'center'
  },
  contentCenterLogo: { 
    flex: 1, alignContent: 'center', justifyContent: 'center',
    paddingTop: 50
  },
  contentCenterBottom: { 
    width: '100%', marginBottom: 50, marginTop: 20, gap: 5, 
    flexDirection: 'column'
  },
  contentCenterTop: {
    height: 40, width: '100%', marginTop: 30
  },
  paddingHorizontal: {
    paddingHorizontal: 10
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
    fontSize: 14, fontFamily: 'Inter-Light', color: '#FFF',
  },
  headline: {
    fontSize: 26, fontFamily: 'Inter-SemiBold', color: '#FFF', marginBottom: 5
  },
  textSubline: {
    fontSize: 14, fontFamily: 'Inter-Light', color: '#FFF', marginBottom: 10
  },
  textCenter: {
    textAlign: 'center'
  },
  textBold: {
    fontSize: 14, fontFamily: 'Inter-Bold', color: '#FFF',
    marginBottom: 3
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
  textLabel: {
    color: '#94a3b8', textTransform: 'uppercase', fontFamily: 'Inter-Bold', fontSize: 12
  },
  textInfo: {
    color: '#fff', fontSize: 28, fontFamily: 'Inter-Bold'
  },


  rowGap: { 
    justifyContent: 'space-between', flexDirection: 'row', alignItems: 'flex-end', gap: 0,
  },  
  sublineMargin : {
    fontFamily: 'Inter-Light', fontSize: 18,
    color: '#FFF', marginBottom: 10, width: '100%'
  },
  bgVideo: {
    backgroundColor: 'rgba(0,0,0,0.7)'
  },


  inputWrapper: { marginBottom: 10 },
  errorMsg: {
    color: '#FFCC00', fontSize: 12, fontFamily: 'Inter-Regular', 
    marginTop: -12, marginBottom: 10
  },
  asterix: { color: '#FF9C7B' },
  label: {
    fontFamily: 'Inter-SemiBold', fontSize: 13, color: '#FFF', 
    marginBottom: 5,
  },
  inputField: {
    flex: 1, fontFamily: 'Inter-Light', fontSize: 14, 
    color: '#FFF', height: 45, width: '100%',
  },
  info: { 
    marginLeft: 6, marginBottom: 5 
  },


  
  
  
})