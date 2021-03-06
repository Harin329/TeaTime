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
  FlatList,
  Animated,
  ImageBackground,
  TextInput,
} from 'react-native';
import BottomSheet, {BottomSheetFlatList} from '@gorhom/bottom-sheet';
import color from '../styles/color';
import moment from 'moment';
import ActionButton from 'react-native-action-button';
import {BlurView} from '@react-native-community/blur';
// import getHeadline from '../cloud-function/getDailyNews';

export default function Home({navigation}) {
  const [profPic, setProfPic] = useState();
  const [today, setToday] = useState([]);
  const [chat, setChat] = useState([]);
  const [name, setName] = useState(auth().currentUser.displayName);
  const [join, setJoin] = useState(false);
  const [groupCode, setCode] = useState('');
  const [add, setAdd] = useState(false);
  const [groupName, setGroupName] = useState('');

  const firstOpacity = useRef(new Animated.Value(1)).current;
  const secondOpacity = useRef(new Animated.Value(0)).current;
  const heightAnimation = useRef(new Animated.Value(50)).current;

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
      width: 300,
      height: '100%',
      borderRadius: 20,
      marginRight: 10,
      shadowColor: color.gray,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
      backgroundColor: '#0000',
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
  const onSheetChange = useCallback((index, toIndex) => {
    if (toIndex === 1) {
      swap();
    } else {
      swapBack();
    }
  }, []);

  function swapBack() {
    Animated.parallel([
      Animated.timing(firstOpacity, {
        toValue: 1,
        duration: 100,
        useNativeDriver: false,
      }),
      Animated.timing(secondOpacity, {
        toValue: 0,
        duration: 100,
        useNativeDriver: false,
      }),
      Animated.timing(heightAnimation, {
        toValue: 50,
        duration: 100,
        useNativeDriver: false,
      }),
    ]).start();
  }

  function swap() {
    Animated.parallel([
      Animated.timing(firstOpacity, {
        toValue: 0,
        duration: 100,
        useNativeDriver: false,
      }),
      Animated.timing(secondOpacity, {
        toValue: 1,
        duration: 100,
        useNativeDriver: false,
      }),
      Animated.timing(heightAnimation, {
        toValue: 100,
        duration: 100,
        useNativeDriver: false,
      }),
    ]).start();
  }

  useEffect(() => {
    getProfilePic();
    getNews();
    getChat();
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
    setName(auth().currentUser.displayName);
  };

  const getNews = async () => {
    console.log(new Date().toDateString());
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

  const getChat = async () => {
    await firestore()
      .collection('Chats')
      .where('Users', 'array-contains', auth().currentUser.uid)
      .orderBy('LastActive', 'desc')
      .get()
      .then((resDocs) => {
        resDocs.forEach((doc) => {
          (async () => {
            try {
              const url = await storage()
                .refFromURL(doc.get('Picture'))
                .getDownloadURL();
              let data = doc.data();
              data.url = url;
              if (!chat.some((item) => item.ID === data.ID)) {
                setChat((prev) => [...prev, data]);
              }
            } catch (err) {
              const url = await storage()
                .ref('DefaultProfPic.png')
                .getDownloadURL();
              let data = doc.data();
              data.url = url;
              if (!chat.some((item) => item.ID === data.ID)) {
                setChat((prev) => [...prev, data]);
              }
            }
          })();
        });
      });
  };

  const renderChat = useCallback(({item}) => (
    <TouchableOpacity
      onPress={() => {
        navigation.push('Chat', {
          chatItem: item,
        });
      }}
      style={{
        marginVertical: 10,
        height: 50,
        flexDirection: 'row',
        alignItems: 'center',
      }}>
      <Image source={{uri: item.url}} style={[styles.profile]} />
      <Text
        style={{
          flex: 3,
          marginLeft: 10,
          fontSize: 16,
          fontFamily: 'Montserrat-Bold',
          color: color.white,
        }}>
        {item.Name}
      </Text>
      <Text
        style={{
          flex: 1,
          fontFamily: 'Montserrat-SemiBold',
          color: color.lightBlue,
          fontSize: 10,
        }}>
        {moment(item.LastActive.toDate(), 'YYYYMMDD').fromNow()}
      </Text>
    </TouchableOpacity>
  ));

  return (
    <SafeAreaView style={styles.safeView}>
      <Image
        source={require('../assets/BackgroundHome.png')}
        style={{
          width: '100%',
          height: '120%',
          position: 'absolute',
          top: 0,
          resizeMode: 'stretch',
        }}
      />
      <View style={styles.lowerView}>
        <View style={{flex: 4}}>
          <Text
            style={{
              fontFamily: 'Montserrat-Bold',
              color: color.gray,
              fontSize: 16,
              textTransform: 'capitalize',
            }}>
            Hello {name},
          </Text>
          <Text
            style={{
              fontFamily: 'Montserrat-SemiBold',
              color: color.blue,
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
            navigation.push('Profile', {
              UserID: auth().currentUser.uid,
            });
          }}>
          <Image source={{uri: profPic}} style={styles.profile} />
        </TouchableOpacity>
      </View>
      <FlatList
        data={today}
        horizontal={true}
        renderItem={({item}) => (
          <TouchableOpacity
            style={styles.imageCard}
            onPress={() => {
              navigation.push('Global', {
                Topic: item,
              });
            }}>
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
        )}
        keyExtractor={(i) => i.title}
        contentContainerStyle={{
          height: '60%',
          marginHorizontal: '8%',
          marginTop: 10,
          paddingRight: 50,
        }}
      />
      <BottomSheet
        ref={bottomSheetRef}
        index={0}
        style={{
          shadowColor: color.gray,
          shadowOffset: {
            width: 0,
            height: -4,
          },
          shadowOpacity: 0.3,
          shadowRadius: 4,
          elevation: 5,
          backgroundColor: '#0000',
        }}
        snapPoints={snapPoints}
        onAnimate={onSheetChange}
        backgroundComponent={null}
        handleComponent={null}>
        <View style={{flex: 1, backgroundColor: color.blue, borderRadius: 30}}>
          <Animated.View
            style={{
              marginHorizontal: '8%',
              marginTop: '10%',
              height: heightAnimation,
            }}>
            <Animated.Text
              style={{
                color: color.white,
                fontFamily: 'Montserrat-Bold',
                fontSize: 14,
                opacity: firstOpacity,
                marginLeft: 10,
              }}>
              Your Chats
            </Animated.Text>
            <Animated.View
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
                    UserID: auth().currentUser.uid,
                  });
                }}>
                <Image source={{uri: profPic}} style={styles.profile} />
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>
          <ActionButton
            buttonColor={color.lightBlue}
            buttonTextStyle={{color: color.blue}}
            shadowStyle={{
              shadowColor: '#2371E7',
              shadowOffset: {
                width: 0,
                height: 4,
              },
              shadowOpacity: 0.5,
              shadowRadius: 4,
              elevation: 5,
            }}
            style={{zIndex: 8, bottom: 20}}>
            <ActionButton.Item
              buttonColor={color.white}
              title=""
              textStyle={{fontFamily: 'Montserrat'}}
              onPress={() => setJoin(true)}>
              <Image
                source={require('../assets/Join.png')}
                style={{
                  width: 30,
                  height: 30,
                  resizeMode: 'contain',
                  tintColor: color.blue
                }}
              />
            </ActionButton.Item>
            <ActionButton.Item
              buttonColor={color.white}
              title=""
              textStyle={{fontFamily: 'Montserrat'}}
              onPress={() => {
                setAdd(true);
              }}>
              <Image
                source={require('../assets/Create.png')}
                style={{
                  width: 30,
                  height: 30,
                  resizeMode: 'contain',
                }}
              />
            </ActionButton.Item>
          </ActionButton>
          {join && (
            <BlurView
              blurAmount={10}
              blurType="light"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                zIndex: 20,
              }}>
              <TouchableOpacity
                onPress={() => {
                  setJoin(false);
                }}
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  height: '100%',
                }}></TouchableOpacity>
              <View
                style={{
                  backgroundColor: color.white,
                  width: '80%',
                  height: '30%',
                  borderRadius: 20,
                  zIndex: 30,
                  position: 'absolute',
                  top: 200,
                  left: 40,
                  bottom: 0,
                  right: 0,
                  zIndex: 20,
                  alignItems: 'center',
                }}>
                <Text
                  style={{
                    fontFamily: 'Montserrat-Bold',
                    color: color.gray,
                    fontSize: 20,
                    marginTop: 30,
                  }}>
                  Join a group
                </Text>
                <TextInput
                  placeholder="Enter group code"
                  onChangeText={(text) => setCode(text)}
                  placeholderTextColor={color.gray}
                  value={groupCode}
                  style={{
                    paddingVertical: 10,
                    marginVertical: 30,
                    marginBottom: 70,
                    width: '80%',
                    fontFamily: 'Montserrat',
                    borderBottomWidth: 1,
                    borderBottomColor: color.gray,
                    color: color.black,
                  }}
                />
                <View
                  style={{
                    width: '100%',
                    height: 1,
                    backgroundColor: color.gray,
                  }}></View>
                <TouchableOpacity
                  style={{width: '100%', alignItems: 'center'}}
                  onPress={async () => {
                    firestore()
                      .collection('Chats')
                      .where('Code', '==', groupCode)
                      .get()
                      .then((resDoc) => {
                        resDoc.forEach((doc) => {
                          if (doc.exists) {
                            doc.ref
                              .update({
                                Users: firestore.FieldValue.arrayUnion(
                                  auth().currentUser.uid,
                                ),
                              })
                              .then(() => {
                                setJoin(false);
                                getChat();
                              });
                          }
                        });
                      });
                  }}>
                  <Text
                    style={{
                      fontFamily: 'Montserrat-Bold',
                      color: color.gray,
                      fontSize: 20,
                      marginTop: 10,
                    }}>
                    Join
                  </Text>
                </TouchableOpacity>
              </View>
            </BlurView>
          )}
          {add && (
            <BlurView
              blurAmount={10}
              blurType="light"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                zIndex: 20,
              }}>
              <TouchableOpacity
                onPress={() => {
                  setAdd(false);
                }}
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  height: '100%',
                }}></TouchableOpacity>
              <View
                style={{
                  backgroundColor: color.white,
                  width: '80%',
                  height: '30%',
                  borderRadius: 20,
                  zIndex: 30,
                  position: 'absolute',
                  top: 200,
                  left: 40,
                  bottom: 0,
                  right: 0,
                  zIndex: 20,
                  alignItems: 'center',
                }}>
                <Text
                  style={{
                    fontFamily: 'Montserrat-Bold',
                    color: color.gray,
                    fontSize: 20,
                    marginTop: 30,
                  }}>
                  Create a group
                </Text>
                <TextInput
                  placeholder="Enter group name"
                  onChangeText={(text) => setGroupName(text)}
                  placeholderTextColor={color.gray}
                  value={groupName}
                  style={{
                    paddingVertical: 10,
                    marginVertical: 30,
                    marginBottom: 70,
                    width: '80%',
                    fontFamily: 'Montserrat',
                    borderBottomWidth: 1,
                    borderBottomColor: color.gray,
                    color: color.black,
                  }}
                />
                <View
                  style={{
                    width: '100%',
                    height: 1,
                    backgroundColor: color.gray,
                  }}></View>
                <TouchableOpacity
                  style={{width: '100%', alignItems: 'center'}}
                  onPress={async () => {
                    firestore()
                      .collection('Chats')
                      .add({
                        LastActive: firestore.FieldValue.serverTimestamp(),
                        Name: groupName,
                        Picture: '',
                        Users: [auth().currentUser.uid],
                      })
                      .then((res) => {
                        res
                          .set(
                            {
                              ID: res.id,
                              Code: res.id.toString().substring(0, 5),
                            },
                            {merge: true},
                          )
                          .then(() => {
                            setAdd(false);
                            getChat();
                          });
                      });
                  }}>
                  <Text
                    style={{
                      fontFamily: 'Montserrat-Bold',
                      color: color.gray,
                      fontSize: 20,
                      marginTop: 10,
                    }}>
                    Create
                  </Text>
                </TouchableOpacity>
              </View>
            </BlurView>
          )}
          <BottomSheetFlatList
            data={[...new Set(chat)]}
            scrollEnabled={true}
            showsVerticalScrollIndicator={false}
            renderItem={renderChat}
            backgroundComponent={null}
            contentContainerStyle={{marginBottom: 100}}
            ItemSeparatorComponent={() => (
              <View
                style={{
                  width: '100%',
                  height: 1,
                  backgroundColor: color.white,
                  borderRadius: 1,
                }}
              />
            )}
            ListFooterComponent={() => (
              <View
                style={{
                  width: '100%',
                  height: 1,
                  backgroundColor: color.white,
                  borderRadius: 1,
                }}
              />
            )}
            style={{marginHorizontal: '8%', marginTop: -10}}
            keyExtractor={(i) => i.ID}
          />
        </View>
      </BottomSheet>
    </SafeAreaView>
  );
}
