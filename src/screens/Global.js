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

export default function Global({navigation}) {
  const styles = StyleSheet.create({
    safeView: {flex: 1, backgroundColor: color.white},
    profile: {
      width: 50,
      height: 50,
      borderRadius: 50,
      resizeMode: 'contain',
      backgroundColor: color.blue,
    },
  });

  const bottomSheetRef = useRef(null);
  const snapPoints = useMemo(() => ['25%', '100%'], []);
  const handleSheetChange = useCallback((index) => {
    console.log(index);
  }, []);

  return (
    <SafeAreaView style={styles.safeView}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginVertical: '5%',
          marginHorizontal: '8%',
        }}>
        <View style={{flex: 4}}>
          <Text
            style={{
              fontFamily: 'Montserrat-Bold',
              color: color.gray,
              fontSize: 18,
              textTransform: 'capitalize',
            }}>
            Hello {auth().currentUser.displayName},
          </Text>
          <Text
            style={{
              fontFamily: 'Montserrat',
              color: color.black,
              fontSize: 20,
            }}>
            What would you like to discuss today?
          </Text>
        </View>
        <TouchableOpacity style={{flex: 1, alignItems: 'flex-end'}}>
          <Image
            source={require('../assets/Back.png')}
            style={styles.profile}
          />
        </TouchableOpacity>
      </View>
      <Button title={'Logout'} onPress={() => auth().signOut()}></Button>
      <BottomSheet
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        onChange={handleSheetChange}
        handleComponent={null}>
        <View style={{flex: 1, backgroundColor: color.blue, borderRadius: 20}}>
          <Text>Hi!</Text>
        </View>
      </BottomSheet>
    </SafeAreaView>
  );
}
