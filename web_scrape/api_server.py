from flask import Flask, jsonify, request
from flask_cors import CORS
from candidates_db import search_candidates, get_candidate_profile

# api_server.py -- tiny flask server that serves candidate data to Next.js
# run this alongside npm run dev
# default port 5000

app = Flask(__name__)
CORS(app)  # allow Next.js on port 3000 to call us



@app.route("/api/candidates/search")
def search():
    q = request.args.get("q", "").strip()
    results = search_candidates(q) if q else search_candidates("a")
    return jsonify(results)


@app.route("/api/candidates/<int:people_id>")
def profile(people_id):
    # GET /api/candidates/7178
    data = get_candidate_profile(people_id)
    if not data:
        return jsonify({"error": "candidate not found"}), 404
    return jsonify(data)


if __name__ == "__main__":
    app.run(port=5000, debug=True)
