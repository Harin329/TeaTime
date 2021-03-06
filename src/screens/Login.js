import React, {useState, useRef} from 'react';
import {
  Text,
  StyleSheet,
  TextInput,
  SafeAreaView,
  View,
  TouchableOpacity,
  Image,
} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import auth from '@react-native-firebase/auth';
import AlertMe from '../components/Alert';
import color from '../styles/color';

export default function Login({navigation}) {
  const [email, onEmailChange] = useState('');
  const [password, onPasswordChange] = useState('');
  const passwordInput = useRef(null);

  const styles = StyleSheet.create({
    safeView: {flex: 1, backgroundColor: color.lightBlue},
    loginView: {flex: 1, alignItems: 'flex-start', padding: '5%'},
    boldBlue: {fontFamily: 'Montserrat-Medium', color: color.blue},
    flexCenter: {flex: 1, alignItems: 'center'},
    logo: {width: '50%', height: 100, resizeMode: 'contain'},
    back: {width: 24, height: 24, resizeMode: 'contain'},
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
    forgot: {
      color: color.blue,
      fontFamily: 'Montserrat',
      fontSize: 10,
      marginTop: -20,
    },
  });

  // Login User
  const login = async (loginEmail, loginPassword) => {
    if (loginEmail !== '') {
      if (loginPassword !== '') {
        await auth()
          .signInWithEmailAndPassword(loginEmail, loginPassword)
          .then((result) => result);
      } else {
        AlertMe('Password Cannot Be Empty', '', null);
      }
    } else {
      AlertMe('Email Cannot Be Empty', '', null);
    }
  };

  // Function to Pass
  const submitForm = () => {
    login(email, password);
  };

  return (
    <SafeAreaView style={styles.safeView}>
      <KeyboardAwareScrollView>
        <TouchableOpacity
          onPress={() => {
            navigation.pop();
          }}
          style={styles.loginView}>
          <Image source={require('../assets/Back.png')} style={styles.back} />
        </TouchableOpacity>
        <View style={styles.flexCenter}>
          <Image source={require('../assets/Logo.png')} style={styles.logo} />
        </View>
        <View style={styles.flexCenter}>
          <Text style={styles.registerText}>Login</Text>
        </View>
        <View style={styles.textInputView}>
          <TextInput
            textContentType="emailAddress"
            placeholder="Email"
            onChangeText={(text) => onEmailChange(text)}
            style={styles.textInput}
            placeholderTextColor={color.blue}
            value={email}
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
          />
          <Text style={styles.forgot}>Forgot password?</Text>
        </View>
        <TouchableOpacity style={styles.signUpButton} onPress={submitForm}>
          <Text style={styles.signUpText}>Log In</Text>
        </TouchableOpacity>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
