import 'react-native-gesture-handler';
import React, { useState } from 'react';
import { Alert, Linking, StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NativeBaseProvider, Button, HStack } from 'native-base';

import CameraView, { checkCameraPermission } from './src/CameraView';

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const closeCamera = () => {
    setCameraEnabled(false)
  }
  const openCamera = () => {
    checkCameraPermission().then(ok => {
      if (ok) {
        setCameraEnabled(true)
      } else {
        Alert.alert(
          'Permission required',
          'Allow camera use in app settings to continue',
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {text: 'Settings', onPress: () => Linking.openSettings()},
          ],
        );
      }
    });
  };

  return (
      <SafeAreaProvider>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <NativeBaseProvider>
            <HStack alignItems="center" justifyContent="space-around">
              <Button onPress={openCamera}>Open</Button>
              <Button onPress={closeCamera}>Close</Button>
            </HStack>
            {cameraEnabled && <CameraView onCreate={console.log} />}
        </NativeBaseProvider>
      </SafeAreaProvider>
    
  );
};

export default App;
