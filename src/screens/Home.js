import React, {useState, useEffect, useRef, useMemo, useCallback} from 'react';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import {
  Text,
  View,
  Image,
  SafeAreaView,
  TouchableOpacity,
  Platform,
  Dimensions,
  PermissionsAndroid,
  StyleSheet,
  Button,
} from 'react-native';
import BottomSheet from '@gorhom/bottom-sheet';
import color from '../styles/color';

export default function Home({navigation}) {
  const styles = StyleSheet.create({
    safeView: {flex: 1, backgroundColor: color.white},
  });

  const bottomSheetRef = useRef(null);
  const snapPoints = useMemo(() => ['25%', '100%'], []);
  const handleSheetChange = useCallback((index) => {
    console.log(index);
  }, []);

  return (
    <SafeAreaView style={styles.safeView}>
      <Text>Welcome</Text>
      <Button title={'Logout'} onPress={() => auth().signOut()}></Button>
      <BottomSheet
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        onChange={handleSheetChange}
        handleComponent={null}
        >
        <View style={{flex: 1, backgroundColor: color.blue, borderRadius: 20}}>
          <Text>Hi!</Text>
        </View>
      </BottomSheet>
    </SafeAreaView>
  );
}
