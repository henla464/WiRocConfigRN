import {useStore} from '@store';

/**
 * Returns the id of the currently active device, i.e. the one
 * we are currently showing in the UI.
 *
 * It should only be used in places where we always expect there
 * to be an active device.
 */
export const useActiveWiRocDevice = () => {
  const deviceId = useStore(state => state.activeDeviceId);
  if (!deviceId) {
    throw new Error('No active device');
  }
  return deviceId;
};
