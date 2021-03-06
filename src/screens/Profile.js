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

export default function Profile({navigation}) {
  const [profPic, setProfPic] = useState();
  const [coverPic, setCoverPic] = useState();

  const styles = StyleSheet.create({
    safeView: {flex: 1, backgroundColor: color.blue},
    profile: {
      width: 100,
      height: 100,
      borderRadius: 100,
      resizeMode: 'cover',
      backgroundColor: color.blue,
      alignSelf: 'center',
      top: '-18%',
      zIndex: 5,
    },
  });

  const bottomSheetRef = useRef(null);
  const snapPoints = useMemo(() => ['70%'], []);
  const handleSheetChange = useCallback((index) => {
    console.log(index);
  }, []);

  useEffect(() => {
    getUserPic();
  }, []);

  const getUserPic = async () => {
    try {
      const pic = storage()
        .ref('ProfilePicture')
        .child(`${auth().currentUser.uid}.jpg`);
      const url = await pic.getDownloadURL();
      setProfPic(url);
    } catch (e) {
      const pic = storage().ref('DefaultProfPic.png');
      const url = await pic.getDownloadURL();
      setProfPic(url);
    }

    try {
      const pic = storage()
        .ref('CoverPicture')
        .child(`${auth().currentUser.uid}.jpg`);
      const url = await pic.getDownloadURL();
      setCoverPic(url);
    } catch (e) {
      // const pic = storage().ref('DefaultProfPic.png');
      // const url = await pic.getDownloadURL();
      // setProfPic(url);
    }
  };

  return (
    <View style={styles.safeView}>
      <Image source={{uri: coverPic}} style={{width: '100%', height: '40%'}} />
      <Image source={{uri: profPic}} style={styles.profile} />
      <BottomSheet
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        onChange={handleSheetChange}
        enableOverDrag={false}
        handleComponent={null}>
        <View style={{flex: 1, backgroundColor: color.white, borderRadius: 20}}>
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
          </View>
          <Button title={'Logout'} onPress={() => auth().signOut()}></Button>
        </View>
      </BottomSheet>
    </View>
  );
}
