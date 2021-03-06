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
  StyleSheet,
  Button,
  ImageBackground,
  FlatList,
  TextInput,
  Animated,
} from 'react-native';
import BottomSheet from '@gorhom/bottom-sheet';
import color from '../styles/color';
import {
  GiftedChat,
  Send,
  InputToolbar,
  MessageText,
} from 'react-native-gifted-chat';

export default function Chat({navigation, route}) {
  var chatItem = route.params.chatItem;
  const [profPic, setProfPic] = useState();

  const [selecting, setSelecting] = useState(false);
  const [recorded, setRecorded] = useState([1, 2, 3]);
  const [isDone, setIsDone] = useState(true);
  const [sport, setSport] = useState({image: null, headline: '', url: ''});
  const [entertainment, setEntertainment] = useState({
    image: null,
    headline: '',
    url: '',
  });
  const [science, setScience] = useState({image: null, headline: '', url: ''});
  const [news, setNews] = useState({image: null, headline: '', url: ''});

  const firstOpacity = useRef(new Animated.Value(1)).current;
  const [currMessage, setCurrMessage] = useState('');
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    getUserPic();

    const messagesListener = firestore()
      .collection('Chats')
      .doc(chatItem.ID)
      .collection('Messages')
      .orderBy('createdAt', 'desc')
      .onSnapshot((querySnapshot) => {
        const m = querySnapshot.docs.map((doc) => {
          const firebaseData = doc.data();

          const data = {
            _id: doc.id,
            text: '',
            createdAt: new Date().getTime(),
            ...firebaseData,
          };

          data.user = {
            ...firebaseData.user
          }

          return data;
        });

        setMessages(m);
      });

      return () => messagesListener();
  }, []);

  function handleSend(newMessage = []) {
    setMessages(GiftedChat.append(messages, newMessage));

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
      resizeMode: 'contain',
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
        <View
          style={{
            width: '90%',
            height: 100,
            backgroundColor: color.lightBlue,
            alignSelf: 'center',
            marginTop: 20,
            borderRadius: 20,
            flexDirection: 'row',
          }}>
          <Text
            style={{
              fontFamily: 'Montserrat-Bold',
              fontSize: 16,
              color: color.blue,
              alignSelf: 'center',
              flex: 2,
              marginTop: 20,
              marginHorizontal: 20,
              textAlign: 'center',
            }}>
            News News News
          </Text>
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              backgroundColor: 'green',
              borderTopRightRadius: 20,
              borderBottomRightRadius: 20,
            }}></View>
        </View>
        <FlatList
          data={recorded}
          horizontal={true}
          style={{marginHorizontal: '5%', marginTop: 10}}
          renderItem={({item}) => (
            <View
              style={{
                width: 70,
                height: 70,
                borderRadius: 70,
                backgroundColor: 'green',
                marginRight: 5,
              }}></View>
          )}
        />
      </View>
    );
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
        <TouchableOpacity style={{flex: 0.5}} onPress={() => {}}>
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
      {isDone && otherVoices()}
      {isDone && (
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
      {!isDone && (
        <View
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: color.white,
            marginTop: 20,
            borderRadius: 20,
          }}>
          <Text
            style={{
              color: color.blue,
              fontFamily: 'Montserrat-Bold',
              alignSelf: 'center',
              margin: 20,
              fontSize: 22,
            }}>
            Choose a topic.
          </Text>
          <FlatList
            data={[sport, entertainment, news, science]}
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
                      style={[styles.imageStyle, {justifyContent: 'flex-end'}]}
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
                <TouchableOpacity style={{alignSelf: 'center', marginTop: 80}}>
                  <Image
                    source={require('../assets/Record.png')}
                    style={{
                      width: 50,
                      height: 50,
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
            }}
          />
        </View>
      )}
    </SafeAreaView>
  );
}
