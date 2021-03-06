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
import {set} from 'react-native-reanimated';

export default function Home({navigation}) {
  const [profPic, setProfPic] = useState();
  const [sportPic, setSportPic] = useState();
  const [entertainmentPic, setEntertainmentPic] = useState();
  const [sciencePic, setSciencePic] = useState();
  const [newsPic, setNewsPic] = useState();

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
      resizeMode: 'cover',
      backgroundColor: color.lightBlue,
    },
    imageCard: {
      width: '49%',
      height: '100%',
      borderRadius: 20,
      backgroundColor: color.lightBlue,
    },
    imageStyle: {
      width: '100%',
      height: '100%',
      borderRadius: 20,
      resizeMode: 'cover',
    },
  });

  const bottomSheetRef = useRef(null);
  const snapPoints = useMemo(() => ['30%', '100%'], []);
  const handleSheetChange = useCallback((index) => {
    console.log(index);
  }, []);

  useEffect(() => {
    getProfilePic();
    getHeadline();
  }, []);

  const getProfilePic = async () => {
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
  };

  const getHeadline = async () => {
    var requestOptions = {
      method: 'GET',
      redirect: 'follow',
    };

    await fetch(
      'https://www.reddit.com/r/sports/top.json?limit=1',
      requestOptions,
    )
      .then((response) => response.text())
      .then((result) => {
        const res = JSON.parse(result);
        const image = res.data.children[0].data.thumbnail;
        setSportPic(image);
        const headline = res.data.children[0].data.title;
        const url = res.data.children[0].data.url;
        // console.log(res);
      })
      .catch((error) => console.log('error', error));

    await fetch(
      'https://www.reddit.com/r/entertainment/top.json?limit=1',
      requestOptions,
    )
      .then((response) => response.text())
      .then((result) => {
        const res = JSON.parse(result);
        const image = res.data.children[0].data.thumbnail;
        setEntertainmentPic(image);
        const headline = res.data.children[0].data.title;
        const url = res.data.children[0].data.url;
        // console.log(res);
      })
      .catch((error) => console.log('error', error));

    await fetch(
      'https://www.reddit.com/r/science/top.json?limit=1',
      requestOptions,
    )
      .then((response) => response.text())
      .then((result) => {
        const res = JSON.parse(result);
        const image = res.data.children[0].data.thumbnail;
        setSciencePic(image);
        const headline = res.data.children[0].data.title;
        const url = res.data.children[0].data.url;
        // console.log(res);
      })
      .catch((error) => console.log('error', error));

    await fetch(
      'https://www.reddit.com/r/news/top.json?limit=1',
      requestOptions,
    )
      .then((response) => response.text())
      .then((result) => {
        const res = JSON.parse(result);
        const image = res.data.children[0].data.thumbnail;
        setNewsPic(image);
        const headline = res.data.children[0].data.title;
        const url = res.data.children[0].data.url;
        // console.log(res);
      })
      .catch((error) => console.log('error', error));
  };

  return (
    <SafeAreaView style={styles.safeView}>
      <View style={styles.lowerView}>
        <View style={{flex: 4}}>
          <Text
            style={{
              fontFamily: 'Montserrat-Bold',
              color: color.gray,
              fontSize: 16,
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
        <TouchableOpacity
          style={{
            flex: 1,
            alignItems: 'flex-end',
            shadowColor: color.gray,
            shadowOffset: {
              width: 0,
              height: 4,
            },
            shadowOpacity: 0.25,
            shadowRadius: 4,
            elevation: 5,
            backgroundColor: '#0000',
          }}
          onPress={() => {
            navigation.push('Profile');
          }}>
          <Image source={{uri: profPic}} style={styles.profile} />
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
            style={styles.imageCard}>
            <Image source={{uri: sportPic}} style={styles.imageStyle} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.imageCard}>
            <Image source={{uri: sciencePic}} style={styles.imageStyle} />
          </TouchableOpacity>
        </View>

        <View
          style={{
            height: '50%',
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}>
          <TouchableOpacity
            style={styles.imageCard}>
            <Image source={{uri: entertainmentPic}} style={styles.imageStyle} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.imageCard}>
            <Image source={{uri: newsPic}} style={styles.imageStyle} />
          </TouchableOpacity>
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
