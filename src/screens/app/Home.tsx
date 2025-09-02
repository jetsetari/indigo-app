import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { styles } from '~/assets/styles/screens/StartStyles';
import HeaderImage from '~/components/Layout/HeaderImage';
import StickyHeader from '~/components/Layout/StickyHeader';
import __base from '~/assets/styles/base';
import HeaderText from '~/components/Layout/HeaderText';
import BottomTabs from '~/components/Layout/BottomTabs';
import { workouts } from '~/data/content/options';
import SingleSelectSection from '~/components/Form/SingleSelectSelection';
import CustomButton from '~/components/Buttons/CustomButton';
import { Badge } from '~/components/Layout/Badge';
import CustomIcon from '~/components/Layout/CustomIcon';

export default function Home() {
  const navigation = useNavigation<any>();
  const [workout, setWorkout] = useState<string>('');
  return (
    <>
      <StickyHeader title="Home" noSticky={true}>
        {/* Header */}
        <View style={__base.headerWithExtra}>
          <View>
            <HeaderText title={'Welcome, Seth'} subtitle="Let’s build your strongest self." />
          </View>
          <HeaderImage image="example" />
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

        {/* Workout */}
        <View style={styles.section}>
          <View style={styles.rowBetween}>
            <Text style={[__base.textBold]}>Workout of Today</Text>
            <TouchableOpacity><Text style={__base.link}>See details</Text></TouchableOpacity>
          </View>
          <SingleSelectSection options={workouts} selected={workout} onChange={setWorkout} />
          <CustomButton title="Start Workout" backgroundColor="#000" borderColor="#00FFB0" textColor="#00FFB0" onPress={() => navigation.navigate('Home')} />
        </View>
        {/* Achievements */}
        <View style={styles.section}>
          <View style={styles.rowBetween}>
            <Text style={[__base.textBold]}>Latest Achievements</Text>
            <TouchableOpacity><Text style={__base.link}>See All</Text></TouchableOpacity>
          </View>
          <View style={__base.infoBox}>
            <View style={__base.infoBoxColumn}>
              <View style={__base.infoBoxIcon}>
                <Badge size={60} border="#F97316" background="#EA580C" icon="heart" />
              </View>
              <Text style={__base.infoBoxValue}>Consistency</Text>
              <Text style={__base.infoBoxLabel}>Level 1</Text>
            </View>
            <View style={__base.infoBoxColumn}>
              <View style={__base.infoBoxIcon}>
                <Badge size={60} border="#A855F7" background="#9333EA" icon="activity" />
              </View>
              <Text style={__base.infoBoxValue}>Progress</Text>
              <Text style={__base.infoBoxLabel}>Level 1</Text>
            </View>
            <View style={__base.infoBoxColumn}>
              <View style={__base.infoBoxIcon}>
                <Badge size={60} border="#84CC16" background="#65A30D" icon="heart" />
              </View>
              <Text style={__base.infoBoxValue}>Workout</Text>
              <Text style={__base.infoBoxLabel}>Level 1</Text>
            </View>
          </View>
        </View>
      </StickyHeader>
      <BottomTabs />
    </>
  );
}
