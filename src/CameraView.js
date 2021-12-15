import React from 'react';
import { AppState, StyleSheet } from 'react-native';
import { Circle, Center, HStack, Image, Pressable, Spinner, ZStack } from 'native-base';
import Icon from 'react-native-vector-icons/Feather';
import { Camera, useCameraDevices } from 'react-native-vision-camera';

const goBack = () => { };
const useIsFocused = () => true;
const useIsAppForeground = () => {
  const [isForeground, setIsForeground] = React.useState(true);

  React.useEffect(() => {
    const onChange = (state) => {
      setIsForeground(state === 'active');
    };
    const sub = AppState.addEventListener('change', onChange);
    return () => sub.remove();
  }, [setIsForeground]);

  return isForeground;
};

export const checkCameraPermission = async () => {
  let permission = await Camera.getCameraPermissionStatus();
  if (permission === 'not-determined') {
    permission = await Camera.requestCameraPermission();
  }
  return permission === 'authorized';
};

const ActionButton = ({ onPress, iconName, size, ...props }) => {
  const buttonSize = size || 70;
  const style = !iconName
    ? {
      border: 5,
      bg: '#F7F7F7',
      borderColor: 'grey',
    }
    : {};
  return (
    <Pressable onPress={onPress}>
      <Center size={buttonSize} borderRadius={buttonSize} {...style} {...props}>
        {iconName && (
          <Icon name={iconName} color="white" size={buttonSize * 0.6} />
        )}
      </Center>
    </Pressable>
  );
};

const CameraFocus = ({ cameraRef, device, size }) => {
  if (!size) size = 60
  const [markerVisible, setMarkerVisible] = React.useState(false)
  const [markerPosition, setMarkerPosition] = React.useState({ top: 0, left: 0 })
  const showMarker = ({ nativeEvent }) => {
    const { locationX, locationY } = nativeEvent
    const top = Math.max(locationY - size / 2, 0)
    const left = Math.max(locationX - size / 2, 0)
    setMarkerPosition({ top, left })
    setMarkerVisible(true)
  }
  const focusCamera = ({ nativeEvent }) => {
    const { locationX, locationY } = nativeEvent
    cameraRef && cameraRef.current && cameraRef.current.focus({
      x: locationX,
      y: locationY
    }).then(() => {
      console.log("focused")
      setMarkerVisible(false)
    }, console.log)
  }
  const handlePress = (event) => {
    showMarker(event)
    focusCamera(event)
  }

  //v2: onPressIn={showMarker} onPressOut={focusCamera}
  return  device && device.supportsFocus ? (
    <Center flex={1}>
      <Pressable flex={1} w="100%" onPress={handlePress}>
        {markerVisible && (
          <Circle
            size={size}
            borderRadius={size}
            borderColor="#F7F7F7"
            borderWidth="2"
            {...markerPosition} />
        )}
      </Pressable>
    </Center>
    ) : null
}

const CameraView = ({ onCreate }) => {
  const isAppForeground = useIsAppForeground();
  const isFocused = useIsFocused();
  const devices = useCameraDevices('wide-angle-camera');
  const device = devices.back;

  const camera = React.useRef(null);
  const [photo, setPhoto] = React.useState(null);
  const [flash, setFlash] = React.useState('off');

  const takePhoto = () => {
    camera &&
      camera.current &&
      camera.current
        .takePhoto({ flash, skipMetadata: true })
        .then(({ path, height, width }) => {
          if (path) {
            const uri = `file://${path}`;
            const fileName = path.split('/').pop();
            setPhoto({ uri, fileName, height, width });
          } else {
          }
        });
  };

  const complete = () => {
    onCreate && onCreate([photo]);
    goBack();
  };

  const cancel = () => {
    setPhoto(null);
  };

  const switchFlash = () => {
    setFlash(flash === 'off' ? 'on' : 'off');
  };

  return device == null ? (
    <Center flex={1}>
      <Spinner color="grey" size={50} />
    </Center>
  ) : photo == null ? (
    <ZStack flex={1}>
      <Camera
        ref={camera}
        style={StyleSheet.absoluteFill}
        device={device}
        photo={true}
        isActive={isFocused && isAppForeground}
      />
      <CameraFocus cameraRef={camera} device={device} />
      <HStack w="100%" justifyContent="flex-end" p={5}>
        <ActionButton
          onPress={switchFlash}
          iconName={`zap${flash === 'off' ? '-off' : ''}`}
          size={50}
        />
      </HStack>
      <Center justifyContent="space-between" px={10} bottom={10} w="100%">
        <ActionButton onPress={takePhoto} />
      </Center>
    </ZStack>
  ) : (
    <ZStack flex={1}>
      <Image size="100%" alt={photo.fileName} source={{ uri: photo.uri }} />
      <HStack w="100%" justifyContent="space-between" px={10} bottom={10}>
        <ActionButton onPress={cancel} iconName="x" bg="danger.500" />
        <ActionButton onPress={complete} iconName="check" bg="success.500" />
      </HStack>
    </ZStack>
  );
};

export default CameraView;
