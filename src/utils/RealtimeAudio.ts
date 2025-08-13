export class AudioRecorder {
  private stream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private processor: ScriptProcessorNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;

  constructor(private onAudioData: (audioData: Float32Array) => void) {}

  async start() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 24000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      this.audioContext = new AudioContext({
        sampleRate: 24000,
      });
      
      this.source = this.audioContext.createMediaStreamSource(this.stream);
      this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);
      
      this.processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        this.onAudioData(new Float32Array(inputData));
      };
      
      this.source.connect(this.processor);
      this.processor.connect(this.audioContext.destination);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      throw error;
    }
  }

  stop() {
    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }
    if (this.processor) {
      this.processor.disconnect();
      this.processor = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

class AudioQueue {
  private queue: Uint8Array[] = [];
  private isPlaying = false;
  private audioContext: AudioContext;

  constructor(audioContext: AudioContext) {
    this.audioContext = audioContext;
  }

  async addToQueue(audioData: Uint8Array) {
    this.queue.push(audioData);
    if (!this.isPlaying) {
      await this.playNext();
    }
  }

  private async playNext() {
    if (this.queue.length === 0) {
      this.isPlaying = false;
      return;
    }

    this.isPlaying = true;
    const audioData = this.queue.shift()!;

    try {
      const wavData = this.createWavFromPCM(audioData);
      const audioBuffer = await this.audioContext.decodeAudioData(wavData.buffer);
      
      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.audioContext.destination);
      
      source.onended = () => this.playNext();
      source.start(0);
    } catch (error) {
      console.error('Error playing audio:', error);
      this.playNext(); // Continue with next segment even if current fails
    }
  }

  private createWavFromPCM(pcmData: Uint8Array): Uint8Array {
    // Convert bytes to 16-bit samples
    const int16Data = new Int16Array(pcmData.length / 2);
    for (let i = 0; i < pcmData.length; i += 2) {
      int16Data[i / 2] = (pcmData[i + 1] << 8) | pcmData[i];
    }
    
    // Create WAV header
    const wavHeader = new ArrayBuffer(44);
    const view = new DataView(wavHeader);
    
    const writeString = (view: DataView, offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    // WAV header parameters
    const sampleRate = 24000;
    const numChannels = 1;
    const bitsPerSample = 16;
    const blockAlign = (numChannels * bitsPerSample) / 8;
    const byteRate = sampleRate * blockAlign;

    // Write WAV header
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + int16Data.byteLength, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitsPerSample, true);
    writeString(view, 36, 'data');
    view.setUint32(40, int16Data.byteLength, true);

    // Combine header and data
    const wavArray = new Uint8Array(wavHeader.byteLength + int16Data.byteLength);
    wavArray.set(new Uint8Array(wavHeader), 0);
    wavArray.set(new Uint8Array(int16Data.buffer), wavHeader.byteLength);
    
    return wavArray;
  }
}

export const encodeAudioForAPI = (float32Array: Float32Array): string => {
  const int16Array = new Int16Array(float32Array.length);
  for (let i = 0; i < float32Array.length; i++) {
    const s = Math.max(-1, Math.min(1, float32Array[i]));
    int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }
  
  const uint8Array = new Uint8Array(int16Array.buffer);
  let binary = '';
  const chunkSize = 0x8000;
  
  for (let i = 0; i < uint8Array.length; i += chunkSize) {
    const chunk = uint8Array.subarray(i, Math.min(i + chunkSize, uint8Array.length));
    binary += String.fromCharCode.apply(null, Array.from(chunk));
  }
  
  return btoa(binary);
};

export class RealtimeChat {
  private ws: WebSocket | null = null;
  private recorder: AudioRecorder | null = null;
  private audioQueue: AudioQueue | null = null;
  private audioContext: AudioContext | null = null;

  constructor(
    private onMessage: (message: any) => void,
    private onSpeakingChange: (speaking: boolean) => void
  ) {}

  async init() {
    try {
      // Initialize audio context
      this.audioContext = new AudioContext({ sampleRate: 24000 });
      this.audioQueue = new AudioQueue(this.audioContext);

      // Connect to the Supabase edge function WebSocket
      const wsUrl = `wss://ublkhfbpkffpunrjqcto.functions.supabase.co/realtime-chat`;
      
      console.log('Connecting to:', wsUrl);
      
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = async () => {
        console.log('Connected to voice service');
        
        // Start recording
        this.recorder = new AudioRecorder((audioData) => {
          if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({
              type: 'input_audio_buffer.append',
              audio: encodeAudioForAPI(audioData)
            }));
          }
        });
        
        await this.recorder.start();
        this.onMessage({ type: 'connected', message: 'Voice interface ready. Start speaking!' });
      };

      this.ws.onmessage = async (event) => {
        const data = JSON.parse(event.data);
        console.log('Received message:', data);
        
        // Handle different message types
        if (data.type === 'response.audio.delta') {
          this.onSpeakingChange(true);
          
          // Convert base64 to Uint8Array
          const binaryString = atob(data.delta);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          await this.audioQueue?.addToQueue(bytes);
          
        } else if (data.type === 'response.audio.done') {
          this.onSpeakingChange(false);
          
        } else if (data.type === 'response.audio_transcript.delta') {
          // Handle text transcripts
          this.onMessage({
            type: 'transcript',
            role: 'assistant',
            content: data.delta
          });
          
        } else if (data.type === 'conversation.item.input_audio_transcription.completed') {
          // Handle user speech transcription
          this.onMessage({
            type: 'transcript',
            role: 'user',
            content: data.transcript
          });
          
        } else if (data.type === 'bid_created') {
          // Handle bid creation
          this.onMessage({
            type: 'bid_created',
            bid_data: data.bid_data
          });
          
        } else if (data.type === 'error') {
          this.onMessage({
            type: 'error',
            message: data.message
          });
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.onMessage({ type: 'error', message: 'Connection error' });
      };

      this.ws.onclose = () => {
        console.log('WebSocket closed');
        this.onMessage({ type: 'disconnected', message: 'Voice interface disconnected' });
      };

    } catch (error) {
      console.error('Error initializing chat:', error);
      throw error;
    }
  }

  async sendMessage(text: string) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('Voice service not connected');
    }

    const event = {
      type: 'conversation.item.create',
      item: {
        type: 'message',
        role: 'user',
        content: [
          {
            type: 'input_text',
            text
          }
        ]
      }
    };

    this.ws.send(JSON.stringify(event));
    this.ws.send(JSON.stringify({type: 'response.create'}));
  }

  disconnect() {
    this.recorder?.stop();
    this.ws?.close();
    this.audioContext?.close();
  }
}