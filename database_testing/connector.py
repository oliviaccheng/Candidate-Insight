import psycopg2
import getpass
# this can be made more portable by creating a database.ini file 
# and reading the connection params from there using a configparser.
# this is for simplicity, but can be implemented later (like mid-late April)
p = getpass.getpass("Password: ")
connection = psycopg2.connect(host="localhost", port=5432,database="les_candidats", user="postgres", password=p) 

crsr = connection.cursor()
print("PostgreSQL database version: ")
# crsr can be used to execute SQL queries. we use it here to grab the version.

crsr.execute("SELECT version()")
db_version = crsr.fetchone()
print(db_version)

# also, the name of the table is candidates, which is distinctly english.
crsr.execute("SELECT * FROM candidates")
rows = crsr.fetchall()
#rows = crsr.fetchmany(5)
for row in rows:   
    print(row)

# other notes:
# fetchone = one line, fetchall = all lines, fetchmany = # of lines.

