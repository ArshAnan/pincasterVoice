from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import openai
import os
import tempfile
import uuid

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Set your OpenAI API key
openai.api_key = os.environ.get("OPENAI_API_KEY", "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")

# Store conversation history
conversation_history = {}
# Store temporary audio files
temp_audio_files = {}

@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    user_message = data.get('message')
    poi_key = data.get('poiKey')
    session_id = data.get('sessionId', 'default')
    use_voice = data.get('useVoice', False)  # New parameter to enable/disable voice
    
    if not user_message:
        return jsonify({"error": "Message is required"}), 400
    
    # Get or initialize conversation history for this session
    if session_id not in conversation_history:
        conversation_history[session_id] = []
    
    # Add context about the POI if provided
    poi_context = get_poi_context(poi_key) if poi_key else ""
    
    # Add user message to history
    conversation_history[session_id].append({"role": "user", "content": user_message})
    
    try:
        # Prepare messages for OpenAI
        messages = [
            {"role": "system", "content": f"You are a helpful tour guide assistant. {poi_context} Keep your responses concise and informative, suitable for spoken audio."}
        ]
        messages.extend(conversation_history[session_id])
        
        # Call OpenAI API
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=messages,
            max_tokens=150,
            temperature=0.7
        )
        
        # Extract the response
        ai_response = response.choices[0].message.content
        
        # Add AI response to history
        conversation_history[session_id].append({"role": "assistant", "content": ai_response})
        
        # Generate audio if voice is enabled
        audio_url = None
        if use_voice:
            audio_url = generate_audio(ai_response, session_id)
            
        return jsonify({
            "response": ai_response,
            "audioUrl": audio_url
        })
    
    except Exception as e:
        print(f"Error calling OpenAI API: {str(e)}")
        return jsonify({"error": str(e)}), 500

def generate_audio(text, session_id):
    try:
        # Generate a unique filename for this audio
        filename = f"{uuid.uuid4()}.mp3"
        
        # Create a temporary file
        audio_response = openai.audio.speech.create(
            model="tts-1",
            voice="alloy",  # Options: alloy, echo, fable, onyx, nova, shimmer
            input=text
        )
        
        # Save the audio file temporarily
        temp_file_path = os.path.join(tempfile.gettempdir(), filename)
        audio_response.stream_to_file(temp_file_path)
        
        # Store the file path in our dictionary
        if session_id not in temp_audio_files:
            temp_audio_files[session_id] = []
        temp_audio_files[session_id].append(temp_file_path)
        
        # Return the URL to access this audio file
        return f"/get-ai-audio/{filename}"
        
    except Exception as e:
        print(f"Error generating audio: {str(e)}")
        return None

@app.route('/get-ai-audio/<filename>', methods=['GET'])
def get_ai_audio(filename):
    # Find the file in our temporary storage
    for session_files in temp_audio_files.values():
        for file_path in session_files:
            if os.path.basename(file_path) == filename:
                return send_file(file_path, mimetype="audio/mpeg")
    
    return jsonify({"error": "Audio file not found"}), 404

def get_poi_context(poi_key):
    """Return context information about a point of interest"""
    poi_info = {
        "statueOfLiberty": "The Statue of Liberty is a colossal neoclassical sculpture on Liberty Island in New York Harbor. A gift from the people of France, it was dedicated in 1886 and symbolizes freedom and democracy.",
        "centralPark": "Central Park is an urban park in New York City located between the Upper West and Upper East Sides of Manhattan. It is the most visited urban park in the United States.",
        "timesSquare": "Times Square is a major commercial intersection, tourist destination, entertainment center, and neighborhood in Midtown Manhattan. It's known for its bright lights, billboards, and as the site of the annual New Year's Eve ball drop.",
        "empireStateBuilding": "The Empire State Building is a 102-story Art Deco skyscraper in Midtown Manhattan. It was completed in 1931 and was the world's tallest building until 1970. It's known for its observation deck and iconic status in the New York skyline.",
        "brooklynBridge": "The Brooklyn Bridge is a hybrid cable-stayed/suspension bridge connecting Manhattan and Brooklyn over the East River. Completed in 1883, it was the first fixed crossing of the East River and is a National Historic Landmark.",
        "oneWorldTrade": "One World Trade Center is the main building of the rebuilt World Trade Center complex in Lower Manhattan. At 1,776 feet tall, it's the tallest building in the United States and symbolizes resilience after the 9/11 attacks.",
        "metMuseum": "The Metropolitan Museum of Art, known as 'the Met', is the largest art museum in the United States. Located on the east side of Central Park, it houses over 2 million works spanning 5,000 years of world culture.",
        # Add more POIs as needed
    }
    
    return poi_info.get(poi_key, "")

@app.route('/reset-conversation', methods=['POST'])
def reset_conversation():
    data = request.json
    session_id = data.get('sessionId', 'default')
    
    # Clear conversation history
    if session_id in conversation_history:
        conversation_history[session_id] = []
    
    # Clean up temporary audio files
    if session_id in temp_audio_files:
        for file_path in temp_audio_files[session_id]:
            try:
                if os.path.exists(file_path):
                    os.remove(file_path)
            except Exception as e:
                print(f"Error removing temporary file {file_path}: {str(e)}")
        temp_audio_files[session_id] = []
    
    return jsonify({"status": "conversation reset"})

# Cleanup function to run periodically or on shutdown
def cleanup_temp_files():
    for session_id, file_paths in temp_audio_files.items():
        for file_path in file_paths:
            try:
                if os.path.exists(file_path):
                    os.remove(file_path)
            except Exception as e:
                print(f"Error removing temporary file {file_path}: {str(e)}")

# Run cleanup on server shutdown
import atexit
atexit.register(cleanup_temp_files)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)
