import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';

import CustomButton from '~/components/Buttons/CustomButton';
import IconButton from '~/components/Buttons/IconButton';
import StickyHeader from '~/components/Layout/StickyHeader';
import HeaderText from '~/components/Layout/HeaderText';
import HeaderImage from '~/components/Layout/HeaderImage';
import Toggle from '~/components/Form/Toggle';

import __base from '~/assets/styles/base';
import { styles } from '~/assets/styles/screens/PaymentStyle';

export default function PaymentScreen() {
  const [billing, setBilling] = useState<'Monthly' | 'Yearly'>('Monthly');
  const [selectedPlan, setSelectedPlan] = useState<'plus' | 'free'>('plus');
  const navigation = useNavigation<any>();

  const isYearly = billing === 'Yearly';

  return (
    <StickyHeader title="Payment">
      {/*<View style={__base.headerWithExtra}>
        <View>
          <IconButton route="Supplements" />
          <HeaderText title="Payment Options" subtitle="Choose your tier" />
        </View>
        <HeaderImage image="example" />
      </View>*/}

      <Toggle
        options={['Monthly', 'Yearly']}
        selected={billing}
        onChange={(value) => setBilling(value as 'Monthly' | 'Yearly')}
      />

      {/* Plus Plan */}
      <TouchableOpacity
        style={[styles.planBox, selectedPlan === 'plus' && styles.selectedBox]}
        onPress={() => setSelectedPlan('plus')}
      >
        {isYearly && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>50% OFF</Text>
          </View>
        )}
        <View style={styles.planHeader}>
          <Text style={styles.planTitle}>PLUS PLAN</Text>
          {selectedPlan === 'plus' && <Feather name="check" size={20} color="#000" />}
        </View>
        <Text style={styles.planPrice}>
          ${isYearly ? '5.99' : '11.99'} USD <Text style={styles.perMonth}>/mo</Text>
        </Text>
        <Text style={styles.planDesc}>Advanced features & AI Insights</Text>
        <TouchableOpacity onPress={() => console.log('https://example.com')}>
          <Text style={styles.learnMore}>Learn More</Text>
        </TouchableOpacity>
      </TouchableOpacity>

      {/* Free Plan */}
      <TouchableOpacity
        style={[styles.planBox, selectedPlan === 'free' && styles.selectedBox]}
        onPress={() => setSelectedPlan('free')}
      >
        <View style={styles.planHeader}>
          <Text style={styles.planTitle}>FREE PLAN</Text>
          {selectedPlan === 'free' && <Feather name="check" size={20} color="#000" />}
        </View>
        <Text style={styles.planPrice}>
          $0 USD <Text style={styles.perMonth}>/mo</Text>
        </Text>
        <Text style={styles.planDesc}>Basic fitness features & functionality</Text>
        <TouchableOpacity onPress={() => console.log('https://example.com')}>
          <Text style={styles.learnMore}>Learn More</Text>
        </TouchableOpacity>
      </TouchableOpacity>

      <Text style={styles.disclaimer}>
        10 Day trial. Change plans or cancel anytime.
      </Text>

      <View style={styles.linksRow}>
        <TouchableOpacity onPress={() => console.log('https://example.com/privacy')}>
          <Text style={styles.link}>Privacy Policy</Text>
        </TouchableOpacity>
        <Text style={styles.dot}>•</Text>
        <TouchableOpacity onPress={() => console.log('https://example.com/terms')}>
          <Text style={styles.link}>Terms & Conditions</Text>
        </TouchableOpacity>
      </View>

      <CustomButton
        title="Ready to commit?"
        backgroundColor="#000"
        textColor="#FFF"
        onPress={() => navigation.navigate('Home')}
      />
    </StickyHeader>
  );
}


