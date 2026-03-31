from flask import Flask, jsonify
from flask_cors import CORS
import psycopg2
import getpass

app = Flask(__name__)
CORS(app)

p = getpass.getpass("Password: ")

conn = psycopg2.connect(
    host="localhost",
    database="les_candidats",
    user="postgres",
    password=p
)

@app.route('/data')
def get_data():
    cur = conn.cursor()
    cur.execute("SELECT * FROM candidates;")
    rows = cur.fetchall()

    result = []
    for row in rows:
        result.append(row)

    cur.close()
    return jsonify(result)

app.run(host='0.0.0.0', port=5000)