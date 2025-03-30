from flask import Flask, request, jsonify
from qdrant_client import QdrantClient
from qdrant_client.http import models
from openai import OpenAI
from flask_cors import CORS
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}}, supports_credentials=True)

QDRANT_URL = os.getenv("QDRANT_URL")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
COLLECTION_NAME = "chatbot_context"

qdrant_client = QdrantClient(url=QDRANT_URL, api_key=QDRANT_API_KEY)
openai_client = OpenAI(api_key=OPENAI_API_KEY)

def generate_embedding(text):
    response = openai_client.embeddings.create(model="text-embedding-ada-002", input=text)
    return response.data[0].embedding

@app.route("/entries", methods=["GET"])
def get_entries():
    points = qdrant_client.scroll(collection_name=COLLECTION_NAME, limit=1000, with_payload=True)[0]
    entries = [{"id": p.id, "name": p.payload["name"], "text": p.payload["text"], "tags": p.payload.get("tags", [])} for p in points]
    return jsonify(entries)

@app.route("/entry", methods=["POST"])
def add_entry():
    data = request.json
    if not data.get("name") or not data.get("text") or not data.get("tags") or len(data.get("tags", [])) == 0:
        return jsonify({"error": "Name, text, and at least one tag are required"}), 400
    id = max([int(p.id) for p in qdrant_client.scroll(collection_name=COLLECTION_NAME, limit=1000)[0]] or [0]) + 1
    name = data["name"]
    text = data["text"]
    tags = data.get("tags", [])
    combined_text = f"{name}: {text} {' '.join(tags)}" if tags else f"{name}: {text}"
    vector = generate_embedding(combined_text)
    qdrant_client.upsert(
        collection_name=COLLECTION_NAME,
        points=[models.PointStruct(id=id, vector=vector, payload={"name": name, "text": text, "tags": tags})]
    )
    return jsonify({"id": id, "name": name, "text": text, "tags": tags})

@app.route("/entry/<int:id>", methods=["PUT"])
def edit_entry(id):
    data = request.json
    if not data.get("name") or not data.get("text") or not data.get("tags") or len(data.get("tags", [])) == 0:
        return jsonify({"error": "Name, text, and at least one tag are required"}), 400
    name = data["name"]
    text = data["text"]
    tags = data.get("tags", [])
    combined_text = f"{name}: {text} {' '.join(tags)}" if tags else f"{name}: {text}"
    vector = generate_embedding(combined_text)
    qdrant_client.upsert(
        collection_name=COLLECTION_NAME,
        points=[models.PointStruct(id=id, vector=vector, payload={"name": name, "text": text, "tags": tags})]
    )
    return jsonify({"id": id, "name": name, "text": text, "tags": tags})

@app.route("/entry/<int:id>", methods=["DELETE"])
def delete_entry(id):
    qdrant_client.delete(
        collection_name=COLLECTION_NAME,
        points_selector=models.PointIdsList(points=[id])
    )
    return jsonify({"message": "Entry deleted"})

@app.route("/search", methods=["GET"])
def search_entries():
    try:
        query = request.args.get("q", "")
        tags_param = request.args.get("tags", "")
        
        print(f"Received search request - query: '{query}', tags: '{tags_param}'")
        
        tags = []
        if tags_param:
            tags = [tag.strip() for tag in tags_param.split(',') if tag.strip()]
            print(f"Parsed tags: {tags}")
        
        if not query and not tags:
            return get_entries()
        
        must = []
        if tags:
            for tag in tags:
                must.append({"key": "tags", "match": {"value": tag}})
            print(f"Created filter with conditions: {must}")
        
        query_filter = models.Filter(must=must) if must else None
        
        if query:
            vector = generate_embedding(query)
            response = qdrant_client.search(
                collection_name=COLLECTION_NAME,
                query_vector=vector,
                query_filter=query_filter,
                limit=20,
                with_payload=True
            )
        else:
            response = qdrant_client.scroll(
                collection_name=COLLECTION_NAME,
                scroll_filter=query_filter,
                limit=20,
                with_payload=True
            )[0]
        
        entries = [{"id": p.id, "name": p.payload["name"], "text": p.payload["text"], 
                    "tags": p.payload.get("tags", [])} for p in response]
        return jsonify(entries)
    except Exception as e:
        import traceback
        print(f"Error in search_entries: {str(e)}")
        print(traceback.format_exc())
        return jsonify({"error": str(e)}), 500

# New endpoint to get all unique tags
@app.route("/tags", methods=["GET"])
def get_tags():
    try:
        points = qdrant_client.scroll(collection_name=COLLECTION_NAME, limit=1000, with_payload=True)[0]
        all_tags = set()
        for point in points:
            tags = point.payload.get("tags", [])
            all_tags.update(tags)
        return jsonify({"tags": sorted(list(all_tags))})
    except Exception as e:
        import traceback
        print(f"Error in get_tags: {str(e)}")
        print(traceback.format_exc())
        return jsonify({"error": str(e)}), 500

@app.route("/test", methods=["GET"])
def test_cors():
    return jsonify({"message": "CORS is working!"})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)