import React, {useState, useRef} from 'react';
import {
  Text,
  TextInput,
  SafeAreaView,
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import AlertMe from '../components/Alert';
import color from '../styles/color';

export default function SignUp({navigation}) {
  const [username, onUsernameChange] = useState('');
  const [email, onEmailChange] = useState('');
  const [password, onPasswordChange] = useState('');
  const [confirmPassword, onConfirmChange] = useState('');
  const emailInput = useRef(null);
  const passwordInput = useRef(null);
  const confirmInput = useRef(null);

  const styles = StyleSheet.create({
    safeView: {flex: 1, backgroundColor: color.lightBlue},
    loginView: {flex: 1, alignItems: 'flex-end', padding: '5%'},
    boldBlue: {fontFamily: 'Montserrat-Medium', color: color.blue},
    flexCenter: {flex: 1, alignItems: 'center'},
    logo: {width: '50%', height: 100, resizeMode: 'contain'},
    registerText: {
      fontSize: 20,
      paddingVertical: 20,
      fontFamily: 'Montserrat-Bold',
      color: color.blue,
    },
    textInputView: {
      flex: 1,
      alignItems: 'flex-start',
      paddingHorizontal: '20%',
    },
    textInput: {
      paddingVertical: 10,
      marginBottom: 30,
      width: '100%',
      fontFamily: 'Montserrat',
      borderBottomWidth: 1,
      borderBottomColor: color.blue,
      color: color.blue,
    },
    signUpButton: {
      width: '50%',
      height: 50,
      backgroundColor: color.blue,
      alignSelf: 'center',
      borderRadius: 29,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 50,
    },
    signUpText: {color: color.white, fontFamily: 'Montserrat-Medium'},
  });

  // Start Signup Process
  const signUp = async (newUsername, newEmail, newPassword, confirm) => {
    const usernameLower = newUsername.toLowerCase();
    if (password === confirm) {
      if (password.length >= 6) {
        if (
          usernameLower.length <= 30 &&
          !usernameLower.includes('/') &&
          usernameLower.length >= 1
        ) {
          await auth()
            .createUserWithEmailAndPassword(newEmail, newPassword)
            .then((result) => {
              result.user.updateProfile({
                displayName: usernameLower,
              });
              
              firestore().collection('Users').doc(result.user.uid).set({
                UID: result.user.uid,
                Username: usernameLower,
                Bio: 'Hey, Welcome to My TeaTime Profile!',
                ProfPic:
                  'gs://sfhacks2021.appspot.com/ProfilePicture/DefaultProfPic.png',
                Following: 0,
                Followers: 0,
              });
            });
        } else {
          AlertMe(
            'Username must be between 1-30 characters and cannot contain special characters',
            '',
            null,
          );
        }
      } else {
        AlertMe(
          'Password must contain at least 6 characters and a special character',
          '',
          null,
        );
      }
    } else {
      AlertMe('Password Does Not Match', '', null);
    }
  };

  // Function to Pass
  const submitForm = () => {
    signUp(username, email, password, confirmPassword);
  };

  return (
    <SafeAreaView style={styles.safeView}>
      <KeyboardAwareScrollView>
        <TouchableOpacity
          onPress={() => {
            navigation.push('Login');
          }}
          style={styles.loginView}>
          <Text style={styles.boldBlue}>Login</Text>
        </TouchableOpacity>
        <View style={styles.flexCenter}>
          <Image source={require('../assets/Logo.png')} style={styles.logo} />
        </View>
        <View style={styles.flexCenter}>
          <Text style={styles.registerText}>Register</Text>
        </View>
        <View style={styles.textInputView}>
          <TextInput
            textContentType="username"
            placeholder="Username"
            onChangeText={(text) => onUsernameChange(text)}
            style={styles.textInput}
            placeholderTextColor={color.blue}
            value={username}
            onSubmitEditing={() => {
              emailInput.current.focus();
            }}
          />
          <TextInput
            keyboardType="email-address"
            textContentType="emailAddress"
            placeholder="Email"
            onChangeText={(text) => onEmailChange(text)}
            placeholderTextColor={color.blue}
            style={styles.textInput}
            value={email}
            ref={emailInput}
            onSubmitEditing={() => {
              passwordInput.current.focus();
            }}
          />
          <TextInput
            textContentType="newPassword"
            secureTextEntry
            placeholder="Password"
            onChangeText={(text) => onPasswordChange(text)}
            placeholderTextColor={color.blue}
            style={styles.textInput}
            value={password}
            ref={passwordInput}
            onSubmitEditing={() => {
              confirmInput.current.focus();
            }}
          />
          <TextInput
            textContentType="newPassword"
            secureTextEntry
            placeholder="Confirm Password"
            onChangeText={(text) => onConfirmChange(text)}
            placeholderTextColor={color.blue}
            style={styles.textInput}
            value={confirmPassword}
            ref={confirmInput}
          />
        </View>
        <TouchableOpacity style={styles.signUpButton} onPress={submitForm}>
          <Text style={styles.signUpText}>Sign Up</Text>
        </TouchableOpacity>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
