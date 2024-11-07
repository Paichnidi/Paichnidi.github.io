from flask import Flask, request, jsonify
from flask_cors import CORS
import asyncio
import threading
from bot import DiscordBot
import nest_asyncio
from functools import partial
from config import OFFICERS

app = Flask(__name__)
CORS(app)

# Enable nested event loops
nest_asyncio.apply()

# Create bot instance
discord_bot = DiscordBot()

# Create a queue for messages
message_queue = asyncio.Queue()

async def process_messages():
    while True:
        try:
            officer_id, officer_name, complaint = await message_queue.get()
            await discord_bot.send_complaint(officer_id, officer_name, complaint)
        except Exception as e:
            print(f"Error processing message: {e}")

# Start bot in a separate thread
def run_bot():
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    loop.create_task(process_messages())
    discord_bot.run()

bot_thread = threading.Thread(target=run_bot, daemon=True)
bot_thread.start()

@app.route('/get-officers', methods=['GET'])
def get_officers():
    return jsonify(OFFICERS)

@app.route('/submit-complaint', methods=['POST'])
def submit_complaint():
    try:
        data = request.json
        officer_id = data.get('officerId')
        officer_name = data.get('officerName')
        
        # Create complaint data dictionary
        complaint_data = {
            'misconductType': data.get('misconductType'),
            'incidentDate': data.get('incidentDate'),
            'location': data.get('location'),
            'witnesses': data.get('witnesses'),
            'complaint': data.get('complaint'),
            'evidence': data.get('evidence')
        }
        
        # Add to queue
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        loop.run_until_complete(message_queue.put((officer_id, officer_name, complaint_data)))
        
        return jsonify({"message": "Complaint submitted successfully"}), 200
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, use_reloader=False) 