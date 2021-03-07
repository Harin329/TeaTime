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
  TextInput,
  Linking,
} from 'react-native';
import BottomSheet from '@gorhom/bottom-sheet';
import color from '../styles/color';
import moment from 'moment';
import TrackPlayer, {STATE_PLAYING} from 'react-native-track-player';
import DropDownPicker from 'react-native-dropdown-picker';

export default function Global({navigation, route}) {
  const topic = route.params.Topic;
  const [profPic, setProfPic] = useState();
  const [recordings, setRecordings] = useState([]);
  const [search, setSearch] = useState([]);
  const [language, setLanguage] = useState();

  const styles = StyleSheet.create({
    safeView: {flex: 1, backgroundColor: color.blue},
    profile: {
      width: 50,
      height: 50,
      borderRadius: 50,
      resizeMode: 'cover',
      backgroundColor: color.lightBlue,
    },
  });

  const bottomSheetRef = useRef(null);
  const snapPoints = useMemo(() => ['85%'], []);
  const handleSheetChange = useCallback((index) => {
    console.log(index);
  }, []);

  useEffect(() => {
    getProfilePic();
    getVoices();
  }, []);

  const getVoices = async () => {
    await firestore()
      .collection('Recordings')
      .where('Global', '==', true)
      .where('TopicID', '==', topic.ID)
      .orderBy('Timestamp', 'desc')
      .get()
      .then((resDocs) => {
        resDocs.forEach(async (doc) => {
          let data = doc.data();
          await firestore()
            .collection('Topics')
            .doc(data.TopicID)
            .get()
            .then(async (topicDoc) => {
              if (topicDoc.exists) {
                try {
                  const pic = storage()
                    .ref('ProfilePicture')
                    .child(`${data.UserID}.jpg`);
                  const url = await pic.getDownloadURL();
                  if (
                    !recordings.some(
                      (item) =>
                        item.UserID === data.UserID &&
                        item.TopicID === data.TopicID,
                    )
                  ) {
                    setRecordings((prev) => [
                      ...prev,
                      {...data, ...topicDoc.data(), userPic: url},
                    ]);
                  }
                } catch (e) {
                  const pic = storage().ref('DefaultProfPic.png');
                  const url = await pic.getDownloadURL();
                  if (
                    !recordings.some(
                      (item) =>
                        item.UserID === data.UserID &&
                        item.TopicID === data.TopicID,
                    )
                  ) {
                    setRecordings((prev) => [
                      ...prev,
                      {...data, ...topicDoc.data(), userPic: url},
                    ]);
                  }
                }
              }
            });
        });
      });
  };

  const changeLanguage = (language) => {
    setLanguage(language);
  };

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
          flexDirection: 'row',
          alignItems: 'center',
          marginTop: 50,
          marginHorizontal: '8%',
        }}>
        <TouchableOpacity
          style={{flex: 1}}
          onPress={() => {
            navigation.pop();
          }}>
          <Image
            source={require('../assets/Back.png')}
            style={{
              tintColor: color.white,
              width: 24,
              height: 24,
              resizeMode: 'contain',
            }}
          />
        </TouchableOpacity>
        <Text
          style={{
            color: color.white,
            fontFamily: 'Montserrat-Bold',
            fontSize: 18,
            flex: 5,
          }}>
          Here's what the world has to say...
        </Text>
        <TouchableOpacity
          style={{
            flex: 2,
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
              UserID: auth().currentUser.uid,
            });
          }}>
          <Image source={{uri: profPic}} style={styles.profile} />
        </TouchableOpacity>
      </View>
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
              marginHorizontal: '5%',
              height: 55,
            }}>
            <View
              style={{
                flex: 7,
                flexDirection: 'row',
                borderWidth: 1,
                borderRadius: 10,
                height: 40,
                borderColor: color.gray,
              }}>
              <Image
                source={require('../assets/Search.png')}
                style={{
                  width: 20,
                  height: 20,
                  resizeMode: 'contain',
                  alignSelf: 'center',
                  marginHorizontal: 5,
                }}
              />
              <TextInput
                placeholder="Search..."
                onChangeText={(text) => setSearch(text)}
                style={{
                  fontFamily: 'Montserrat',
                  color: color.gray,
                  marginLeft: 5,
                }}
                placeholderTextColor={color.gray}
                value={search}
              />
            </View>
            <View style={{flex: 1}} />
            <View
              style={{
                flex: 3.5,
                justifyContent: 'flex-start',
                height: 100,
              }}>
              <DropDownPicker
                items={[
                  {
                    label: 'English',
                    value: 'English',
                    icon: () => null,
                  },
                  {
                    label: 'French',
                    value: 'French',
                    icon: () => null,
                  },
                ]}
                containerStyle={{height: 40, zIndex: 10}}
                globalTextStyle={{fontFamily: 'Montserrat', color: color.gray}}
                arrowColor={color.gray}
                style={{borderColor: 'transparent'}}
                defaultValue="English"
                onChangeItem={(item) => changeLanguage(item.value)}
              />
            </View>
          </View>
          <FlatList
            data={[...recordings, ...recordings]}
            numColumns={2}
            ListHeaderComponent={
              <TouchableOpacity
              onPress={() => Linking.openURL(topic.url)}
                style={{
                  marginHorizontal: '5%',
                  height: 100,
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: color.gray,
                  marginBottom: 20,
                  flexDirection: 'row'
                }}>
                <Text
                  style={{
                    fontFamily: 'Montserrat-Bold',
                    fontSize: 14,
                    color: color.gray,
                    alignSelf: 'center',
                    flex: 2,
                    marginHorizontal: 15,
                    textAlign: 'center',
                    textAlignVertical: 'center',
                  }}>
                  {topic.title}
                </Text>
                <View
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    borderTopRightRadius: 20,
                    borderBottomRightRadius: 20,
                  }}>
                  <Image
                    source={{uri: topic.image}}
                    style={{
                      width: '100%',
                      height: '100%',
                      borderTopRightRadius: 18,
                      borderBottomRightRadius: 18,
                    }}
                  />
                </View>
              </TouchableOpacity>
            }
            style={{zIndex: -1, marginTop: 10}}
            keyExtractor={(i) => i}
            contentContainerStyle={{paddingBottom: 50}}
            renderItem={({item, index}) => (
              <View style={{width: '44%', marginLeft: 15, marginBottom: 10}}>
                <TouchableOpacity
                  style={{
                    width: '100%',
                    height: index % 4 == 0 || index % 4 == 3 ? 300 : 200,
                    marginTop: (index % 4 == 3) ? -100 : 0,
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
                    source={{uri: item.userPic}}
                    style={{
                      width: '100%',
                      height: '100%',
                      alignItems: 'flex-end',
                      justifyContent: 'flex-end',
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
