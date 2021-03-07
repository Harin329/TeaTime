import React, {useState, useEffect, useRef, useMemo, useCallback} from 'react';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import storage from '@react-native-firebase/storage';
import {
  Text,
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ImageBackground,
} from 'react-native';
import BottomSheet from '@gorhom/bottom-sheet';
import color from '../styles/color';
import moment from 'moment';
import TrackPlayer, {STATE_PLAYING} from 'react-native-track-player';

export default function Profile({navigation, route}) {
  const UserID = route.params.UserID;
  const [profPic, setProfPic] = useState();
  const [following, setFollowing] = useState(false);
  const [user, setUser] = useState({});
  const [recordings, setRecordings] = useState([]);

  const styles = StyleSheet.create({
    safeView: {flex: 1, backgroundColor: color.blue},
    profile: {
      width: 100,
      height: 100,
      borderRadius: 100,
      resizeMode: 'cover',
      alignSelf: 'center',
      top: '-16%',
      zIndex: 5,
    },
  });

  const bottomSheetRef = useRef(null);
  const snapPoints = useMemo(() => ['80%'], []);
  const handleSheetChange = useCallback((index) => {
    console.log(index);
  }, []);

  useEffect(() => {
    getUserInfo();
    getUserPic();
  }, []);

  const getUserInfo = async () => {
    await firestore()
      .collection('Users')
      .doc(UserID)
      .get()
      .then((res) => {
        if (res.exists) {
          setUser(res.data());
        }
      });

    await firestore()
      .collection('Recordings')
      .where('Global', '==', true)
      .where('UserID', '==', UserID)
      .orderBy('Timestamp', 'desc')
      .get()
      .then((resDocs) => {
        resDocs.forEach(async (doc) => {
          let data = doc.data();
          await firestore()
            .collection('Topics')
            .doc(data.TopicID)
            .get()
            .then((topicDoc) => {
              if (topicDoc.exists) {
                if (
                  !recordings.some(
                    (item) =>
                      item.UserID === data.UserID &&
                      item.TopicID === data.TopicID,
                  )
                ) {
                  setRecordings((prev) => [
                    ...prev,
                    {...data, ...topicDoc.data()},
                  ]);
                }
              }
            });
        });
      });
  };

  const getUserPic = async () => {
    try {
      const pic = storage().ref('ProfilePicture').child(`${UserID}.jpg`);
      const url = await pic.getDownloadURL();
      setProfPic(url);
    } catch (e) {
      const pic = storage().ref('DefaultProfPic.png');
      const url = await pic.getDownloadURL();
      setProfPic(url);
    }

    // try {
    //   const pic = storage()
    //     .ref('CoverPicture')
    //     .child(`${UserID}.jpg`);
    //   const url = await pic.getDownloadURL();
    //   setCoverPic(url);
    // } catch (e) {
    //   // const pic = storage().ref('DefaultProfPic.png');
    //   // const url = await pic.getDownloadURL();
    //   // setProfPic(url);
    // }
  };

  return (
    <View style={styles.safeView}>
      <Image style={{width: '100%', height: '30%'}} />
      <Image source={{uri: profPic}} style={styles.profile} />
      <BottomSheet
        ref={bottomSheetRef}
        index={0}
        style={{
          shadowColor: '#2371E7',
          shadowOffset: {
            width: 0,
            height: -4,
          },
          shadowOpacity: 0.8,
          shadowRadius: 4,
          elevation: 5,
          backgroundColor: '#0000',
        }}
        snapPoints={snapPoints}
        onChange={handleSheetChange}
        backgroundComponent={null}
        enableOverDrag={false}
        handleComponent={null}>
        <View style={{flex: 1, backgroundColor: color.white, borderRadius: 20}}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginTop: '8%',
              marginHorizontal: '8%',
              height: 70,
            }}>
            <TouchableOpacity
              onPress={() => {
                navigation.pop();
              }}
              style={{flex: 1}}>
              <Image
                source={require('../assets/Back.png')}
                style={{
                  width: 24,
                  height: 24,
                  resizeMode: 'contain',
                  tintColor: color.blue,
                }}
              />
            </TouchableOpacity>
            <View style={{flex: 3}}>
              <Text
                style={{
                  fontFamily: 'Montserrat-Bold',
                  color: color.black,
                  fontSize: 20,
                  alignSelf: 'center',
                  marginTop: 35,
                }}>
                {user.FullName !== undefined ? user.FullName : user.Username}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                UserID === auth().currentUser.uid ? auth().signOut() : null;
              }}
              style={{flex: 1, alignItems: 'flex-end'}}>
              <Image
                source={require('../assets/More.png')}
                style={{
                  width: 24,
                  height: 24,
                  resizeMode: 'contain',
                  tintColor: color.blue,
                }}
              />
            </TouchableOpacity>
          </View>
          <View
            style={{
              height: 50,
              flexDirection: 'row',
              justifyContent: 'center',
            }}>
            <View
              style={{
                width: 100,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Image
                source={require('../assets/Follow.png')}
                style={{
                  width: 20,
                  height: 20,
                  resizeMode: 'contain',
                  tintColor: color.gray,
                }}
              />
              <Text
                style={{
                  fontFamily: 'Montserrat-Bold',
                  color: color.gray,
                  marginLeft: 5,
                }}>
                {user.Followers}
              </Text>
            </View>
            <View style={{width: 10}} />
            <View style={{width: 100, justifyContent: 'center'}}>
              <TouchableOpacity
                onPress={() => setFollowing(!following)}
                style={{
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: color.gray,
                  height: '60%',
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: following ? color.gray : 'transparent',
                }}>
                <Text
                  style={{
                    fontFamily: 'Montserrat-SemiBold',
                    color: following ? color.white : color.gray,
                  }}>
                  {following ? 'Following' : 'Follow'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <FlatList
            data={recordings}
            numColumns={2}
            ListHeaderComponent={
              <View style={{marginHorizontal: '8%'}}>
                <Text
                  style={{
                    fontFamily: 'Montserrat-Bold',
                    color: color.black,
                  }}>
                  About
                </Text>
                <Text
                  style={{
                    fontFamily: 'Montserrat',
                    color: color.gray,
                    marginTop: 10,
                  }}>
                  {user.Bio}
                </Text>
                <Text
                  style={{
                    fontFamily: 'Montserrat-Bold',
                    color: color.black,
                    marginVertical: 30,
                  }}>
                  Endorsed Notes
                </Text>
              </View>
            }
            keyExtractor={(i) => i}
            renderItem={({item}) => (
              <View style={{width: '44%', marginLeft: 15, marginBottom: 30}}>
                <TouchableOpacity
                  style={{
                    width: '100%',
                    height: 200,
                    backgroundColor: 'green',
                    borderRadius: 20,
                  }}
                  onPress={() => {
                    storage()
                      .ref('Recording')
                      .child(item.UserID + '_' + item.TopicID + '.mp3')
                      .getDownloadURL()
                      .then((res) => {
                        console.log(res);
                        const start = async () => {
                          await TrackPlayer.setupPlayer();

                          const state = await TrackPlayer.getState();

                          if (state === STATE_PLAYING) {
                            await TrackPlayer.stop();
                          } else {
                            await TrackPlayer.add({
                              id: item.UserID,
                              url: res,
                              title: '',
                              artist: '',
                            });
                            await TrackPlayer.play();
                          }
                        };
                        start();
                      });
                  }}>
                  <ImageBackground
                    source={{uri: item.PhotoURL}}
                    style={{
                      width: '100%',
                      height: '100%',
                    }}
                    resizeMode={'cover'}
                    borderRadius={20}>
                    <Image
                      source={require('../assets/Play.png')}
                      style={{
                        width: 30,
                        height: 30,
                        margin: 10,
                        resizeMode: 'contain',
                      }}
                    />
                  </ImageBackground>
                </TouchableOpacity>
                <Text
                  style={{
                    fontFamily: 'Montserrat',
                    color: color.gray,
                    marginTop: 5,
                    marginLeft: 10,
                    fontSize: 12,
                  }}>
                  {moment(item.Timestamp.toDate(), 'YYYYMMDD').fromNow()}
                </Text>
              </View>
            )}
          />
        </View>
      </BottomSheet>
    </View>
  );
}
