from flask import Flask, request, jsonify
from flask_cors import CORS
from vosk import Model, KaldiRecognizer
import tempfile
import json
import wave
import os

app = Flask(__name__)
CORS(app)  # allow requests from your Next.js app

# Load Vosk models
english_model_path = "./VOICE-DRONE/vosk-model-en-in-0.5"
hindi_model_path = "./VOICE-DRONE/vosk-model-hi"

english_model = Model(english_model_path)
hindi_model = Model(hindi_model_path)

@app.route('/transcribe', methods=['POST'])
def transcribe_audio():
    if 'audio' not in request.files:
        return jsonify({"error": "No audio file uploaded"}), 400

    audio_file = request.files['audio']

    # Save the audio temporarily
    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp_audio:
        audio_file.save(temp_audio.name)
        temp_path = temp_audio.name

    try:
        # Open audio file
        wf = wave.open(temp_path, "rb")
        if wf.getnchannels() != 1 or wf.getsampwidth() != 2 or wf.getframerate() != 16000:
            return jsonify({
                "error": "Audio must be WAV mono PCM 16-bit at 16kHz."
            }), 400

        data = wf.readframes(wf.getnframes())

        # ---- English recognition ----
        english_recognizer = KaldiRecognizer(english_model, 16000)
        if english_recognizer.AcceptWaveform(data):
            result = json.loads(english_recognizer.Result())
            recognized_text = result.get("text", "").strip()
            if recognized_text:
                return jsonify({"language": "english", "transcription": recognized_text})

        # ---- Hindi recognition ----
        hindi_recognizer = KaldiRecognizer(hindi_model, 16000)
        if hindi_recognizer.AcceptWaveform(data):
            result = json.loads(hindi_recognizer.Result())
            recognized_text = result.get("text", "").strip()
            if recognized_text:
                return jsonify({"language": "hindi", "transcription": recognized_text})

        # If both failed
        return jsonify({"transcription": "", "message": "Could not recognize speech"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        wf.close()
        os.remove(temp_path)


@app.route('/')
def index():
    return "🎙️ Vosk Transcription API (Hindi + English) is running!"


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
