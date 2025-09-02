import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import HeaderImage from '~/components/Layout/HeaderImage';
import StickyHeader from '~/components/Layout/StickyHeader';
import __base from '~/assets/styles/base';
import HeaderText from '~/components/Layout/HeaderText';
import BottomTabs from '~/components/Layout/BottomTabs';
import CustomIcon from '~/components/Layout/CustomIcon';

export default function Stats() {
  const navigation = useNavigation<any>();

  return (
    <>
      <StickyHeader title="Home" noSticky={true}>
        {/* Header */}
        <View style={__base.headerWithExtra}>
          <View>
            <HeaderText title={'From body stats to daily wins'} subtitle="Your Progress, Clearly Tracked" />
          </View>
        </View>

        {/* Stats */}
        <View style={__base.infoBox}>
          <View style={__base.infoBoxColumn}>
            <CustomIcon icon="Weight" size={25} />
            <Text style={__base.infoBoxValue}>98kg</Text>
            <Text style={__base.infoBoxLabel}>Weight</Text>
          </View>
          <View style={__base.infoBoxColumn}>
            <CustomIcon icon="Birthday" size={25} />
            <Text style={__base.infoBoxValue}>16%</Text>
            <Text style={__base.infoBoxLabel}>Bodyfat</Text>
          </View>
          <View style={__base.infoBoxColumn}>
            <CustomIcon icon="Health" size={25} />
            <Text style={__base.infoBoxValue}>85%</Text>
            <Text style={__base.infoBoxLabel}>score</Text>
          </View>
        </View>
        <Text style={{ color: '#FFF' }}>All Stats Details</Text>
      </StickyHeader>
      <BottomTabs />
    </>
  );
}
