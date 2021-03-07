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
  ImageBackground
} from 'react-native';
import BottomSheet from '@gorhom/bottom-sheet';
import color from '../styles/color';
import moment from 'moment';
import TrackPlayer, {STATE_PLAYING} from 'react-native-track-player';

export default function Global({navigation, route}) {
  const TopicID = route.params.TopicID;
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
      backgroundColor: color.blue,
      alignSelf: 'center',
      top: '-18%',
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
    getProfilePic();
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

  return (
    <View style={styles.safeView}>
      <View
              style={{
                opacity: secondOpacity,
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <TouchableOpacity
                onPress={() => {
                  bottomSheetRef.current.collapse();
                }}>
                <Image
                  source={require('../assets/Back.png')}
                  style={{
                    tintColor: color.white,
                    width: 24,
                    height: 24,
                    resizeMode: 'contain',
                    marginRight: 20,
                    transform: [{rotate: '270deg'}],
                  }}
                />
              </TouchableOpacity>
              <Text
                style={{
                  color: color.white,
                  fontFamily: 'Montserrat-Bold',
                  fontSize: 18,
                }}>
                Your Chats
              </Text>
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
                  navigation.push('Profile', {
                    UserID: auth().currentUser.uid
                  });
                }}>
                <Image source={{uri: profPic}} style={styles.profile} />
              </TouchableOpacity>
            </View>
      <Image style={{width: '100%', height: '30%'}} />
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
              marginTop: '5%',
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
                  marginTop: 30,
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
                    fontFamily: 'Montserrat-Medium',
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
                    fontSize: 12
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