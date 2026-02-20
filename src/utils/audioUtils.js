export function pcmToWav(base64PCM, sampleRate = 24000) {
  try {
    const binaryString = atob(base64PCM);
    const len = binaryString.length;
    const buffer = new ArrayBuffer(len);
    const view = new Uint8Array(buffer);
    for (let i = 0; i < len; i++) {
      view[i] = binaryString.charCodeAt(i);
    }
    const pcmData = new Int16Array(buffer);
    const wavHeader = new ArrayBuffer(44);
    const headerView = new DataView(wavHeader);
    
    headerView.setUint8(0, 'R'.charCodeAt(0));
    headerView.setUint8(1, 'I'.charCodeAt(0));
    headerView.setUint8(2, 'F'.charCodeAt(0));
    headerView.setUint8(3, 'F'.charCodeAt(0));
    headerView.setUint32(4, 36 + pcmData.byteLength, true);
    headerView.setUint8(8, 'W'.charCodeAt(0));
    headerView.setUint8(9, 'A'.charCodeAt(0));
    headerView.setUint8(10, 'V'.charCodeAt(0));
    headerView.setUint8(11, 'E'.charCodeAt(0));
    headerView.setUint8(12, 'f'.charCodeAt(0));
    headerView.setUint8(13, 'm'.charCodeAt(0));
    headerView.setUint8(14, 't'.charCodeAt(0));
    headerView.setUint8(15, ' '.charCodeAt(0));
    headerView.setUint32(16, 16, true);
    headerView.setUint16(20, 1, true); 
    headerView.setUint16(22, 1, true); 
    headerView.setUint32(24, sampleRate, true);
    headerView.setUint32(28, sampleRate * 2, true);
    headerView.setUint16(32, 2, true); 
    headerView.setUint16(34, 16, true); 
    headerView.setUint8(36, 'd'.charCodeAt(0));
    headerView.setUint8(37, 'a'.charCodeAt(0));
    headerView.setUint8(38, 't'.charCodeAt(0));
    headerView.setUint8(39, 'a'.charCodeAt(0));
    headerView.setUint32(40, pcmData.byteLength, true);
    
    return new Blob([wavHeader, pcmData], { type: 'audio/wav' });
  } catch (e) {
    console.error("Audio conversion failed", e);
    return null;
  }
}
