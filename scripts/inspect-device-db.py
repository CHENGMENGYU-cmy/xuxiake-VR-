import json
import sqlite3
import sys

db_path = sys.argv[1]
con = sqlite3.connect(db_path)
con.row_factory = sqlite3.Row

tables = con.execute(
    "select name, sql from sqlite_master where type='table' order by name"
).fetchall()
print(json.dumps([dict(row) for row in tables], ensure_ascii=False, indent=2))

con.close()
