import { useState, useRef } from 'react';
import { request } from '../api/client';
import '../styles/voice.css';

const VoiceAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Namaste! Main AyurSphere Assistant hoon. Aapko kis paudhe ya beemari ke baare mein jaanna hai?' }
  ]);
  const [isPlaying, setIsPlaying] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const currentAudioRef = useRef(null);

  const toggleOpen = () => setIsOpen(!isOpen);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' }); // Browsers gen webm/ogg mostly
        
        // Handle STT + LLM + TTS
        await sendAudio(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      
      // Stop current audio if playing
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        setIsPlaying(false);
      }

    } catch (err) {
      console.error('Mic access error:', err);
      alert('Microphone access is required for the Voice Assistant.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      setIsProcessing(true);
    }
  };

  const sendAudio = async (blob) => {
    try {
      const formData = new FormData();
      // append with .webm or .wav depending on browser, for multer detection
      formData.append('audio', blob, 'recording.webm'); 

      const data = await request('/voice', {
        method: 'POST',
        body: formData,
      });
      
      const newMsgs = [...messages];
      if (data.text) newMsgs.push({ role: 'user', text: data.text });
      if (data.reply) newMsgs.push({ role: 'bot', text: data.reply });
      setMessages(newMsgs);

      if (data.audio) {
        playAudio(data.audio);
      }
    } catch (err) {
      console.error('Voice send error:', err);
      setMessages(prev => [...prev, { role: 'bot', text: 'Sorry, I couldn\'t process that right now.' }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const playAudio = (base64) => {
    // Sarvam returns wav or mp3 base64 usually
    const src = `data:audio/wav;base64,${base64}`;
    const audio = new Audio(src);
    currentAudioRef.current = audio;

    audio.onplay = () => setIsPlaying(true);
    audio.onended = () => setIsPlaying(false);
    audio.onerror = () => setIsPlaying(false);

    audio.play().catch(console.error);
  };

  return (
    <div className="voice-widget-container">
      {/* The Chat Window */}
      <div className={`voice-chat-window ${isOpen ? 'open' : ''}`}>
        <div className="voice-chat-header">
          <div className="vch-left">
            <i className="fas fa-leaf" style={{ color: '#a8ff78' }}></i>
            <span>AyurBot</span>
          </div>
          <button className="vch-close" onClick={toggleOpen}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="voice-chat-body">
          {messages.map((m, i) => (
            <div key={i} className={`vmsg-wrapper ${m.role === 'user' ? 'vmsg-right' : 'vmsg-left'}`}>
              <div className={`vmsg-bubble vmsg-${m.role}`}>
                {m.text}
              </div>
            </div>
          ))}
          {isProcessing && (
            <div className="vmsg-wrapper vmsg-left">
              <div className="vmsg-bubble vmsg-bot processing-dots">
                <span></span><span></span><span></span>
              </div>
            </div>
          )}
        </div>

        <div className="voice-chat-footer">
          {isRecording ? (
            <button className="v-mic-btn recording" onClick={stopRecording}>
              <i className="fas fa-stop"></i>
              <span className="v-mic-ring"></span>
            </button>
          ) : (
            <button className="v-mic-btn" onClick={startRecording} disabled={isProcessing}>
              <i className="fas fa-microphone"></i>
            </button>
          )}
          <span className="v-status-text">
            {isRecording ? 'Listening... Tap to stop' : isProcessing ? 'Thinking...' : 'Tap mic to speak'}
          </span>
        </div>
      </div>

      {/* Floating Toggle Button */}
      <button 
        className={`voice-fab ${isOpen ? 'hidden' : ''} ${isPlaying ? 'playing' : ''}`} 
        onClick={toggleOpen}
      >
        {isPlaying ? <i className="fas fa-volume-up"></i> : <i className="fas fa-microphone"></i>}
      </button>
    </div>
  );
};

export default VoiceAssistant;
