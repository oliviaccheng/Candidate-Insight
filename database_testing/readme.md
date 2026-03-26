# Database
We have elected to use PostgreSQL, an open source database management 
system for the storage and accessibility of our data. Not only is PostgreSQL free
to use, it is known for its reliability. 

# Formatting of Data:
Candidates have the following attributes:

| Column | Type | Allowed for filtering |
|--------|------|-----------------------|
| Name | string | Yes |
| Party | string | Yes |
| State | string | Yes |
| County | string | Yes |
| Electoral District | string | Yes |
| Tweets | string[]? | No |
| Bio | string | No |
| Site/Contact Info | string | No

Note that this can be easily expanded should other attributes be included.

Filtering will be handled by the backend.

Side note: more tweets will be added later, only two files were included for ease of 
testing

## Usage:
I don't know :*(

But it seems that an installation of PostgreSQL is needed to run it locally. The
database that will be stored here will be a static image of it, since PostgreSQL has
a function where you can dump the database into a .sql file.

Eventually, this is will link to a backend that will handle not only the connections
to the database but also the filtering. 3/23 Note: at the moment, prioritization
is for functionality. Later, presumably into April, security will become more 
important to prevent something like an SQL injection.

Note: add requirements.txt for connector.py