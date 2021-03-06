import {Alert} from 'react-native';

export default function AlertMe(message, body, myFunction) {
  Alert.alert(
    message,
    body,
    [
      {
        text: 'OK',
        onPress: myFunction,
      },
    ],
    {cancelable: false},
  );
}
