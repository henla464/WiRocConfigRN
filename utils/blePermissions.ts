import {PermissionsAndroid, Platform} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import {PERMISSIONS, requestMultiple} from 'react-native-permissions';

export const requestBlePermissions = async () => {
  if (Platform.OS === 'android') {
    const apiLevel = await DeviceInfo.getApiLevel();
    if (apiLevel < 31) {
      const grantedStatus = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'Bluetooth Low Energy behöver åtkomst till platsinformation',
          buttonNegative: 'Avbryt',
          buttonPositive: 'OK',
          buttonNeutral: 'Kanske senare',
        },
      );
      return grantedStatus === PermissionsAndroid.RESULTS.GRANTED;
    } else {
      const result = await requestMultiple([
        PERMISSIONS.ANDROID.BLUETOOTH_SCAN,
        PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
        PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
      ]);

      const isAllPermissionsGranted =
        result['android.permission.BLUETOOTH_SCAN'] ===
          PermissionsAndroid.RESULTS.GRANTED &&
        result['android.permission.BLUETOOTH_CONNECT'] ===
          PermissionsAndroid.RESULTS.GRANTED &&
        result['android.permission.ACCESS_FINE_LOCATION'] ===
          PermissionsAndroid.RESULTS.GRANTED;
      return isAllPermissionsGranted;
    }
  } else {
    return true;
  }
};
