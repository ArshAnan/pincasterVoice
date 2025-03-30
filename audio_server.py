from flask import Flask, send_file, request

app = Flask(__name__)

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
        "timesSquare": "audio/times_square.mp3",
        # Add more mappings here...
    }

    audio_path = audio_files.get(poi_key)
    if not audio_path:
        return {"error": "Audio file not found for the given POI key"}, 404

    return send_file(audio_path, mimetype="audio/mpeg")

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
