import React, {useState, useEffect, useRef, useMemo, useCallback} from 'react';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import storage from '@react-native-firebase/storage';
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
  const [profPic, setProfPic] = useState();

  const styles = StyleSheet.create({
    safeView: {flex: 1, backgroundColor: color.white},
    lowerView: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginVertical: '5%',
      marginHorizontal: '8%',
    },
    profile: {
      width: 50,
      height: 50,
      borderRadius: 50,
      resizeMode: 'contain',
      backgroundColor: color.lightBlue,
    },
  });

  const bottomSheetRef = useRef(null);
  const snapPoints = useMemo(() => ['30%', '100%'], []);
  const handleSheetChange = useCallback((index) => {
    console.log(index);
  }, []);

  useEffect(() => {
    getProfilePic();
  }, []);

  const getProfilePic = async () => {
    try {
      const pic = storage()
        .ref('ProfilePicture')
        .child(`${auth().currentUser.uid}.JPG`);
      const url = await pic.getDownloadURL();
      setProfPic(url);
    } catch (e) {
      const pic = storage().ref('DefaultProfPic.png');
      const url = await pic.getDownloadURL();
      setProfPic(url);
    }
  };

  return (
    <SafeAreaView style={styles.safeView}>
      <View style={styles.lowerView}>
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
        <TouchableOpacity style={{flex: 1, alignItems: 'flex-end'}}
        onPress={() => {
          navigation.push('Profile');
        }}>
          <Image
            source={{uri: profPic}}
            style={styles.profile}
          />
        </TouchableOpacity>
      </View>
      <View style={{height: '50%', marginHorizontal: '8%', marginTop: 10}}>
        <View
          style={{
            height: '50%',
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 5,
          }}>
          <TouchableOpacity
            style={{
              width: '49%',
              height: '100%',
              borderRadius: 20,
              backgroundColor: color.blue,
            }}></TouchableOpacity>
          <TouchableOpacity
            style={{
              width: '49%',
              height: '100%',
              borderRadius: 20,
              backgroundColor: color.lightBlue,
            }}></TouchableOpacity>
        </View>

        <View
          style={{
            height: '50%',
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}>
          <TouchableOpacity
            style={{
              width: '49%',
              height: '100%',
              borderRadius: 20,
              backgroundColor: color.blue,
            }}></TouchableOpacity>
          <TouchableOpacity
            style={{
              width: '49%',
              height: '100%',
              borderRadius: 20,
              backgroundColor: color.lightBlue,
            }}></TouchableOpacity>
        </View>
      </View>
      <BottomSheet
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        onChange={handleSheetChange}
        handleComponent={null}>
        <View style={{flex: 1, backgroundColor: color.blue, borderRadius: 20}}>
          <View style={{marginHorizontal: '8%', marginTop: '10%'}}>
            <Text
              style={{
                color: color.white,
                fontFamily: 'Montserrat-Bold',
                fontSize: 18,
              }}>
              Your Chats
            </Text>
          </View>
        </View>
      </BottomSheet>
    </SafeAreaView>
  );
}
