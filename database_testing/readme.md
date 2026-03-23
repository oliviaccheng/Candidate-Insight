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