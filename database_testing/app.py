from flask import Flask, request, jsonify, render_template
import psycopg2
import csv
import os


app = Flask(__name__)

# --- Database connection helper ---
def get_conn():
    # Replace with your actual connection info
    return psycopg2.connect(
        host=os.environ["DB_HOST"],
        port=int(os.environ.get("DB_PORT", 5432)),
        database=os.environ["DB_NAME"],
        user=os.environ["DB_USER"],
        password=os.environ["DB_PASSWORD"]
    )

# --- Serve the HTML page ---
@app.route("/")
def home():
    return render_template("index.html")

def load_tweets(filename):
    tweets = []
    with open(filename, newline='', encoding="utf-8") as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            tweets.append({
                "text": row["text"]   # only grab the text column
            })
    return tweets

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
                "bio": r[5],
                "image": f"/static/images/{r[0]}.jpg"
            }
            for r in results
        ]        
        
        return jsonify(data)

    except Exception as e:
        print("Error:", e)
        return jsonify({"error": "Server error"}), 500

#@app.route("/tweets", methods=["GET"])
#def get_tweets():
    #try#:
        candidate_name = request.args.get("candidate", "").strip()#

#        tweets = load_tweets(candidate_name) 
#        return jsonify(tweets[:20])  # limit to 20 tweets
#    except Exception as e:
#        print(e)
#        return jsonify({"error": "Failed to load tweets"}), 500
    

@app.route("/tweets", methods=["GET"])
def get_tweets():
    try:
        candidate_name = request.args.get("candidate", "").strip()

        if not candidate_name:
            return jsonify([])

        # Use exact name + .csv
        filename = f"{candidate_name}.csv"

        print("Trying to load:", filename)  # debug

        if not os.path.exists(filename):
            print("File not found!")
            return jsonify([])

        tweets = load_tweets(filename)

        return jsonify(tweets[:20])

    except Exception as e:
        print(e)
        return jsonify({"error": "Failed to load tweets"}), 500

# --- Run the app ---
if __name__ == "__main__":
    app.run(debug=True)