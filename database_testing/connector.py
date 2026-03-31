import psycopg2
import getpass
import json

def main():
    # this can be made more portable by creating a database.ini file 
    # and reading the connection params from there using a configparser.
    # this is for simplicity, but can be implemented later (like mid-late April)
    connection = psycopg2.connect(
        #connection information
    ) 

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
    # each row is a tuple.
    for row in rows:   
        print(row)

    # other notes:
    # fetchone = one line, fetchall = all lines, fetchmany = # of lines.
    #read_candidate("Matt Van Epps", crsr)
    
    create_candidate("John Doe", "Independent", "Hennepin", "MN", "Minneapolis", "This is a bio.", crsr)
    # commit the changes to the database, otherwise they won't be saved.
    connection.commit() 

# we don't want people injecting whatever, so here are functions to control database access.
#tbh, there is still probably a massive security risk here.

# here, I will assume that bio is a text file? the rest obviously are strings
def create_candidate(name, party, county, state, electoral_district, bio, crsr):
    crsr.execute("INSERT INTO candidates (name, party, county, state, electoral_district, bio) VALUES (%s, %s, %s, %s, %s, %s)", (name, party, county, state, electoral_district, bio))
    read_candidate(name, crsr)

def read_candidate(name, crsr):
    crsr.execute("SELECT * FROM candidates WHERE name = %s", (name,))
    print(crsr.fetchone())
    
# we will search primarily by name, can I update the name using this?
# this has not been tested, but it should work. hopefully.
def update_candidate(field, new_value, name, crsr):
    crsr.execute(f"UPDATE candidates SET {field} = %s WHERE name = %s", (new_value, name))
    crsr.execute("SELECT * FROM candidates WHERE name = %s", (name,))
    print(crsr.fetchone())
    
if __name__ == "__main__":
    main()