import React, {useState, useEffect} from 'react';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import storage from '@react-native-firebase/storage';
import {
  Text,
  View,
  Image,
  SafeAreaView,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  FlatList,
  Linking,
} from 'react-native';
import color from '../styles/color';
import {
  GiftedChat,
  Send,
  InputToolbar,
  MessageText,
} from 'react-native-gifted-chat';
import TrackPlayer, {STATE_PLAYING} from 'react-native-track-player';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import AlertMe from '../components/Alert';

const audioRecorderPlayer = new AudioRecorderPlayer();

export default function Chat({navigation, route}) {
  var chatItem = route.params.chatItem;
  const [today, setToday] = useState([]);
  const [profPic, setProfPic] = useState();

  const [topic, setTopic] = useState();
  const [myRecording, setMyRecording] = useState(false);
  const [recorded, setRecorded] = useState([]);
  const [recording, setRecording] = useState(false);
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    getUserPic();
    getNews();
    checkTopicSelected();
    getUsernames();
    

    const messagesListener = firestore()
      .collection('Chats')
      .doc(chatItem.ID)
      .collection('Messages')
      .orderBy('createdAt', 'desc')
      .onSnapshot((querySnapshot) => {
        if (querySnapshot.size !== 0) {
          const m = querySnapshot.docs.map((doc) => {
            const firebaseData = doc.data();

            const data = {
              _id: doc.id,
              text: '',
              createdAt: new Date().getTime(),
              ...firebaseData,
            };

            data.user = {
              ...firebaseData.user,
            };

            return data;
          });

          setMessages(m);
        }
      });

    return () => messagesListener();
  }, []);

  const getUsernames = async () => {
    chatItem.Users.forEach(async (user) => {
      firestore().collection('Users').doc(user).get().then((doc) =>  {
        if (!users.some((item) => doc.get('Username') === item.name)) {
          setUsers((prev) => [...prev, {name: doc.get('Username'), id: doc.id}]);
        }
      });
    });
  }

  const getNews = async () => {
    setToday([]);
    await firestore()
      .collection('Topics')
      .where('Date', '==', new Date().toDateString())
      .get()
      .then((resDocs) => {
        resDocs.forEach((doc) => {
          setToday((prev) => [
            ...prev,
            {
              image: doc.get('PhotoURL'),
              title: doc.get('Title'),
              url: doc.get('URL'),
              ID: doc.id,
            },
          ]);
        });
      });
  };

  const checkTopicSelected = async () => {
    const topicListener = firestore()
      .collection('TOTD')
      .where('Date', '==', new Date().toDateString())
      .where('GroupID', '==', chatItem.ID)
      .onSnapshot((resDocs) => {
        if (!resDocs.empty) {
          let tID = resDocs.docs[0].get('TopicID');
          firestore()
            .collection('Topics')
            .doc(tID)
            .get()
            .then((doc) => {
              if (doc.exists) {
                setTopic({...doc.data(), ID: tID});
                getUserVoices(tID);
              }

              firestore()
                .collection('Recordings')
                .doc(auth().currentUser.uid + '_' + tID)
                .get()
                .then((recDoc) => {
                  if (!recDoc.exists) {
                    setToday([
                      {
                        image: doc.get('PhotoURL'),
                        title: doc.get('Title'),
                        url: doc.get('URL'),
                        ID: doc.id,
                      },
                    ]);
                    setMyRecording(false);
                  } else {
                    setMyRecording(true);
                  }
                });
            });
        }
      });
    return () => topicListener();
  };

  var recVar = []
  const getUserVoices = async (TOPIC_ID) => {
    const voiceListener = firestore()
      .collection('Recordings')
      .where('TopicID', '==', TOPIC_ID)
      .where('UserID', 'in', chatItem.Users)
      .onSnapshot((resDocs) => {
        if (!resDocs.empty) {
          resDocs.forEach((doc) => {
            (async () => {
            try {
              const pic = storage()
                .ref('ProfilePicture')
                .child(`${doc.get('UserID')}.jpg`);
              const url = await pic.getDownloadURL();
              if (!recVar.some((item) => item.UserID === doc.data().UserID)) {
                recVar.push({...doc.data(), url})
                setRecorded((prev) => [...prev, {...doc.data(), url}]);
              }
            } catch (e) {
              const pic = storage().ref('DefaultProfPic.png');
              const url = await pic.getDownloadURL();
              if (!recVar.some((item) => item.UserID === doc.data().UserID)) {
                recVar.push({...doc.data(), url})
                setRecorded((prev) => [...prev, {...doc.data(), url}]);
              }
            }
          })();
          });
        }
      });
    return () => voiceListener();
  };

  function handleSend(newMessage = []) {
    setMessages(GiftedChat.append(messages, newMessage));

    users.forEach((hashtag) => {
      if (newMessage[0].text.includes('#'+hashtag.name)) {
        firestore().collection('Recordings').doc(hashtag.id + '_' + topic.ID).set({
          'Global': true
        }, {merge: true})
      }
    })

    firestore()
      .collection('Chats')
      .doc(chatItem.ID)
      .collection('Messages')
      .add({
        text: newMessage[0].text,
        createdAt: new Date().getTime(),
        user: {
          _id: auth().currentUser.uid,
          name: auth().currentUser.displayName,
          avatar: profPic,
        },
      });
  }

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
  };

  const styles = StyleSheet.create({
    safeView: {flex: 1, backgroundColor: color.blue},
    profile: {
      width: 50,
      height: 50,
      borderRadius: 50,
      resizeMode: 'cover',
      backgroundColor: color.blue,
    },
    imageCard: {
      width: 300,
      height: '100%',
      borderRadius: 20,
      marginRight: 10,
      backgroundColor: color.lightBlue,
    },
    imageStyle: {
      width: '100%',
      height: '100%',
      borderRadius: 20,
      resizeMode: 'cover',
    },
  });

  const otherVoices = () => {
    return (
      <View>
        <TouchableOpacity
          onPress={() => {
            Linking.openURL(topic.URL);
          }}
          style={{
            width: '90%',
            height: 100,
            backgroundColor: color.white,
            alignSelf: 'center',
            marginTop: 20,
            borderRadius: 20,
            flexDirection: 'row',
          }}>
          <Text
            style={{
              fontFamily: 'Montserrat-Medium',
              fontSize: 16,
              color: color.gray,
              alignSelf: 'center',
              flex: 2,
              marginHorizontal: 10,
              textAlign: 'center',
              textAlignVertical: 'center',
            }}>
            {topic.Title}
          </Text>
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              borderTopRightRadius: 20,
              borderBottomRightRadius: 20,
            }}>
            <Image
              source={{uri: topic.PhotoURL}}
              style={{
                width: '100%',
                height: '100%',
                borderTopRightRadius: 20,
                borderBottomRightRadius: 20,
              }}
            />
          </View>
        </TouchableOpacity>
        <FlatList
          data={[...new Set(recorded)]}
          horizontal={true}
          style={{marginHorizontal: '5%', marginTop: 10}}
          renderItem={({item}) => (
            <TouchableOpacity
              onPress={() => {
                storage()
                  .ref('Recording')
                  .child(item.UserID + '_' + item.TopicID + '.mp3')
                  .getDownloadURL()
                  .then((res) => {
                    console.log('here')
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
              }}
              style={{
                width: 70,
                height: 70,
                borderRadius: 70,
                marginRight: 5,
              }}>
              <Image
                source={{uri: item.url}}
                style={{
                  width: '100%',
                  height: '100%',
                  resizeMode: 'cover',
                  borderRadius: 70,
                }}></Image>
            </TouchableOpacity>
          )}
        />
      </View>
    );
  };

  const startRecording = async (audioRecorderPlayer) => {
    setRecording(true);
    await audioRecorderPlayer.startRecorder();
    audioRecorderPlayer.addRecordBackListener((e) => {
      // console.log(e.current_position);
    });
  };

  const stopRecording = async (audioRecorderPlayer, topicID) => {
    setRecording(false);
    const res = await audioRecorderPlayer.stopRecorder();
    audioRecorderPlayer.removeRecordBackListener();
    console.log(res);
    await storage()
      .ref('Recording')
      .child(auth().currentUser.uid + '_' + topicID + '.mp3')
      .putFile(res).catch(e => console.log(e));
    await firestore().collection('TOTD').doc(topicID + '_' + chatItem.ID).set({
      Date: new Date().toDateString(),
      GroupID: chatItem.ID,
      TopicID: topicID,
    }).catch(e => console.log(e));
    await firestore()
      .collection('Recordings')
      .doc(auth().currentUser.uid + '_' + topicID)
      .set({
        TopicID: topicID,
        UserID: auth().currentUser.uid,
        Timestamp: firestore.FieldValue.serverTimestamp(),
      }).catch(e => console.log(e));
    setMyRecording(true);
  };

  return (
    <SafeAreaView style={styles.safeView}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginHorizontal: '5%',
        }}>
        <TouchableOpacity
          style={{flex: 0.8}}
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
              marginRight: 20,
            }}
          />
        </TouchableOpacity>
        <View
          style={{
            flex: 1,
            shadowColor: color.gray,
            shadowOffset: {
              width: 0,
              height: 4,
            },
            shadowOpacity: 0.25,
            shadowRadius: 4,
            elevation: 5,
            backgroundColor: '#0000',
          }}>
          <Image source={{uri: chatItem.url}} style={styles.profile} />
        </View>
        <Text
          style={{
            color: color.white,
            fontFamily: 'Montserrat-Bold',
            fontSize: 18,
            marginLeft: 10,
            flex: 4,
          }}>
          {chatItem.Name}
        </Text>
        <TouchableOpacity style={{flex: 0.5}} onPress={() => {
          AlertMe('Group Code is: ' + chatItem.Code, '', null);
        }}>
          <Image
            source={require('../assets/More.png')}
            style={{
              tintColor: color.white,
              width: 24,
              height: 24,
              resizeMode: 'contain',
              marginRight: 20,
            }}
          />
        </TouchableOpacity>
      </View>
      {topic && myRecording && otherVoices()}
      {topic && myRecording && (
        <View
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: color.white,
            marginTop: 20,
            borderRadius: 20,
          }}>
          <ImageBackground
            source={require('../assets/BackgroundChat.png')}
            style={{width: '100%', height: '90%'}}
            resizeMode={'contain'}>
            <View style={{width: '100%', height: '70%', paddingTop: 20}}>
              <GiftedChat
                messages={messages}
                onSend={(newMessage) => handleSend(newMessage)}
                showUserAvatar={true}
                alwaysShowSend={true}
                renderMessageText={(props) => (
                  <MessageText
                    {...props}
                    textStyle={{
                      right: {fontFamily: 'Montserrat'},
                      left: {fontFamily: 'Montserrat'},
                    }}
                  />
                )}
                textInputStyle={{
                  fontFamily: 'Montserrat-Medium',
                  paddingTop: 18,
                }}
                renderInputToolbar={(props) => (
                  <InputToolbar
                    {...props}
                    containerStyle={{
                      paddingTop: 10,
                      height: 40,
                      marginHorizontal: '8%',
                      fontFamily: 'Montserrat',
                      backgroundColor: color.white,
                      borderRadius: 20,
                    }}
                    primaryStyle={{marginTop: -20}}
                    placeholder="Chat..."
                    placeholderTextColor={color.gray}
                  />
                )}
                renderSend={(props) => (
                  <Send
                    {...props}
                    containerStyle={{width: 50, alignItems: 'center'}}>
                    <Image
                      source={require('../assets/Send.png')}
                      style={{
                        width: 16,
                        height: 16,
                        resizeMode: 'contain',
                        marginBottom: 5,
                      }}
                    />
                  </Send>
                )}
                user={{
                  _id: auth().currentUser.uid,
                  name: auth().currentUser.displayName,
                  avatar: profPic,
                }}
              />
            </View>
          </ImageBackground>
        </View>
      )}
      {!myRecording && (
        <View
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: color.white,
            marginTop: 20,
            borderRadius: 20,
          }}>
          <ImageBackground
            source={require('../assets/BackgroundChat.png')}
            style={{width: '100%', height: '100%'}}
            resizeMode={'stretch'}
            borderRadius={20}>
            <Text
              style={{
                color: color.blue,
                fontFamily: 'Montserrat-Bold',
                marginLeft: '8%',
                margin: 20,
                fontSize: 22,
              }}>
              {topic !== undefined
                ? 'The topic for today is...'
                : 'Choose a topic.'}
            </Text>
            <FlatList
              data={today}
              horizontal={true}
              renderItem={({item}) => (
                <View>
                  <TouchableOpacity style={styles.imageCard}>
                    <ImageBackground
                      source={{uri: item.image}}
                      style={[styles.imageStyle, {justifyContent: 'flex-end'}]}
                      resizeMode="cover"
                      borderRadius={20}>
                      <ImageBackground
                        source={require('../assets/BlackFade.png')}
                        style={[
                          styles.imageStyle,
                          {justifyContent: 'flex-end'},
                        ]}
                        resizeMode="cover"
                        borderRadius={20}>
                        <View style={{borderRadius: 20}}>
                          <Text
                            style={{
                              color: color.white,
                              fontFamily: 'Montserrat-Bold',
                              fontSize: 20,
                              margin: 20,
                            }}>
                            {item.title}
                          </Text>
                        </View>
                      </ImageBackground>
                    </ImageBackground>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{alignSelf: 'center', marginTop: 80}}
                    onPress={() => {
                      if (recording) {
                        stopRecording(audioRecorderPlayer, item.ID);
                      } else {
                        startRecording(audioRecorderPlayer);
                      }
                    }}>
                    <Image
                      source={
                        recording
                          ? require('../assets/Recording.png')
                          : require('../assets/Record.png')
                      }
                      style={{
                        width: 70,
                        height: 70,
                        resizeMode: 'contain',
                      }}
                    />
                  </TouchableOpacity>
                </View>
              )}
              keyExtractor={(i) => i.title}
              contentContainerStyle={{
                height: '60%',
                marginHorizontal: '8%',
                marginTop: 10,
                paddingRight: 50,
              }}
            />
          </ImageBackground>
        </View>
      )}
    </SafeAreaView>
  );
}
