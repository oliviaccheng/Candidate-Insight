from flask import Flask, request, jsonify, render_template
import psycopg2

app = Flask(__name__)

# --- Database connection helper ---
def get_conn():
    # Replace with your actual connection info
    return psycopg2.connect(
        dbname="les_candidats",
        user="neondb_owner",
        password="npg_YzcNj0gG9hQs",
        host="ep-cool-mode-ajyk5rlh-pooler.c-3.us-east-2.aws.neon.tech",
        port="5432"
    )

# --- Serve the HTML page ---
@app.route("/")
def home():
    return render_template("index.html")

# --- Search API ---
@app.route("/search", methods=["GET"])
def search():
    query = request.args.get("q", "").strip()

    if len(query) < 2:
        return jsonify([])

    try:
        conn = get_conn()
        cur = conn.cursor()

        sql = """
            SELECT name, party, state, county, electoral_district, bio
            FROM candidates
            WHERE name ILIKE %s
            LIMIT 20;
        """
        search_term = f"%{query}%"
        cur.execute(sql, (search_term,))
        results = cur.fetchall()

        cur.close()
        conn.close()

        data = [
            {
                "name": r[0],
                "party": r[1],
                "state": r[2],
                "county": r[3],
                "electoral_district": r[4],
                "bio": r[5]
            }
            for r in results
        ]        
        
        return jsonify(data)

    except Exception as e:
        print("Error:", e)
        return jsonify({"error": "Server error"}), 500

# --- Run the app ---
if __name__ == "__main__":
    app.run(debug=True)