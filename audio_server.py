from flask import Flask, send_file, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Endpoint to serve audio files
@app.route('/get-audio', methods=['GET'])
def get_audio():
    poi_key = request.args.get('poi_key')  # Get the POI key from the query parameter
    if not poi_key:
        return {"error": "POI key is required"}, 400

    # Map POI keys to audio file paths
    audio_files = {
        "statueOfLiberty": "audio/statue_of_liberty.mp3",
        "centralPark": "audio/central_park.mp3",
        "timesSquare": "audio/times.mp3",  # Updated to use times.mp3
        "worldTradeCenter": "audio/wtc.mp3",  # Added World Trade Center mapping
        # Add more mappings here...
    }

    audio_path = audio_files.get(poi_key)
    if not audio_path:
        return {"error": "Audio file not found for the given POI key"}, 404

    try:
        return send_file(audio_path, mimetype="audio/mpeg")
    except Exception as e:
        return {"error": str(e)}, 500

# Endpoint for chat API
@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    # In a real implementation, this would process the message and return a response
    return jsonify({
        "response": f"Here's information about {data.get('poiKey', 'this location')}.",
        "audioUrl": f"/audio/{data.get('poiKey', 'default')}.mp3"
    })

# Endpoint to reset conversation
@app.route('/reset-conversation', methods['POST'])
def reset_conversation():
    # In a real implementation, this would clear the conversation history
    return jsonify({"success": True})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
