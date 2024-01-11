export const chunkLengthToUse: number = 150; // MTU of 153 (3 byte header) should work on all phones hopefully

export type OnEmitCallback = (deviceId: string, data: string) => void;

/**
 * Helper to manager incoming chunks of BLE data.
 */
export const createBleChunkHelper = () => {
  let totalRecievedByDevice: Record<string, Buffer> = {};
  let subscribers = new Set<OnEmitCallback>();

  const provideChunk = (deviceId: string, chunk?: string | null) => {
    if (!totalRecievedByDevice[deviceId]) {
      totalRecievedByDevice[deviceId] = Buffer.from('');
    }

    const newChunk = Buffer.from(chunk ?? '', 'base64');
    totalRecievedByDevice[deviceId] = Buffer.concat([
      totalRecievedByDevice[deviceId],
      newChunk,
    ]);

    if (newChunk.length >= chunkLengthToUse) {
      console.log(
        '[BLE-BUFFER] expecting more data, totalRecieved:',
        totalRecievedByDevice[deviceId].length,
        totalRecievedByDevice[deviceId].toString('utf8'),
      );
      // This is not the full value, wait for the next fragment
      return;
    }

    console.debug(
      '[BLE-BUFFER] Got all data, parsing...',
      totalRecievedByDevice[deviceId],
    );

    const data = totalRecievedByDevice[deviceId].toString('utf8');

    // Reset
    totalRecievedByDevice[deviceId] = Buffer.from('');

    subscribers.forEach(subscriber => subscriber(deviceId, data));
  };

  const subscribe = (callback: OnEmitCallback) => {
    subscribers.add(callback);
    return () => {
      subscribers.delete(callback);
    };
  };

  const unsubscribe = (callback: OnEmitCallback) => {
    subscribers.delete(callback);
  };

  return {
    provideChunk,
    subscribe,
    unsubscribe,
  };
};
