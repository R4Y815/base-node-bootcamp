DROP TABLE IF EXISTS owners;
DROP TABLE IF EXISTS cats;

CREATE TABLE owners (
    id SERIAL PRIMARY KEY,
    name TEXT
);

CREATE TABLE cats (
  id SERIAL PRIMARY KEY, 
  name TEXT, 
  owner_id INTEGER,
  CONSTRAINT fk_owner
    FOREIGN KEY(owner_id)
      REFERENCES owners(id)
);

