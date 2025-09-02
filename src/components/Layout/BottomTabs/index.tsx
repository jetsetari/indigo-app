import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';

import { styles } from './BottomTabsStyles';


const tabs = [
  { name: 'Home', icon: 'home' },
  { name: 'Workouts', icon: 'activity' },
  { name: 'Stats', icon: 'bar-chart-2' },
  { name: 'Profile', icon: 'user' },
];

export default function BottomTabs() {
  const navigation = useNavigation<any>();
  const route = useRoute();

  return (
    <View style={styles.wrapper}>
      <View style={styles.tabsWrapper}>
        {tabs.map((tab) => {
          const isActive = route.name === tab.name;
          return (
            <TouchableOpacity
              key={tab.name}
              style={isActive ? styles.tabActive : styles.tab}
              onPress={() => navigation.navigate(tab.name)}
            >
              <Feather
                name={tab.icon as any}
                size={20}
                color={isActive ? '#FFF' : '#000'}
              />
              { isActive && <Text style={[styles.label, isActive && styles.activeLabel]}>
                {tab.name}
              </Text> }
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
