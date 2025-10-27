import CustomIcon from '../CustomIcon';
import React, { useRef } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from './FirstItemStyle';

type IconName = React.ComponentProps<typeof CustomIcon>['icon'];


type Props = {
  title: string;
  icon: IconName;
  description: string;
  onClick: () => void;
};

function FirstItem({ title, description, icon, onClick }: Props) {
  return (
    <TouchableOpacity onPress={onClick}>
      <View style={styles.firstItemSubWrapper}>
        <CustomIcon icon={icon} size={25} />
        <Text style={styles.firstItemTitle}>{title}</Text>
        <Text style={styles.firstItemSub}>{description}</Text>
      </View>
    </TouchableOpacity> 
  );
}
export default FirstItem;