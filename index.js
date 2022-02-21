import { argv } from 'process';
import pg from 'pg';
const { Client } = pg;

// set the way we will connect to the server
const pgConnectionConfigs = {
  user: 'raytor27',
  host: 'localhost',
  database: 'cat_owners',
  port: 5432, // Postgres server always runs on this port
};

// create the var we'll use
const client = new Client(pgConnectionConfigs);

// make the connection to the server
client.connect();

// create the query done callback
const whenQueryDone = (error, result) => {
  // this error is anything that goes wrong with the query
  if (error) {
    console.log('error', error);
  } else {
    // rows key has the data
    console.log(result.rows);
  }

  // close the connection
  client.end();
}

function showAllCats() {
  const sqlQuery1 = 'SELECT * FROM cats';
  // run the SQL query
  client.query(sqlQuery1, whenQueryDone);
}

function showAllOwners() {
  const sqlQuery1B = 'SELECT * FROM owners';
  // run the SQL query
  client.query(sqlQuery1B, whenQueryDone);
}

function createOwner() {
  const inputOwnerData = [process.argv[3]];
  const sqlQuery4 = `INSERT INTO owners (name) VALUES ($1)`;
  const query = {text: sqlQuery4, values: inputOwnerData };
  client.query(query, whenQueryDone);
}

function createCat() {
  const inputCatData = [process.argv[3], process.argv[4]];
  const sqlQuery5 = `INSERT INTO cats (owner_id, name) VALUES ($1, $2 );`;
  const query2 = {text: sqlQuery5, values: inputCatData };
  client.query(query2, whenQueryDone);
}

function listCatsWithOwners(cats, owners) {
  console.log('Cats:');
  cats.forEach((cat, index) => {
    console.log(`${index + 1}. ${cat.name}:`);
    owners
      .filter((owner) => owner.id === cat.owner_id)
      .forEach((owner) => console.log(`            --->${owner.name}`));
    client.end();
  });
}

function listOwnersWithCats(cats, owners) {
  console.log('Owners: ');
  owners.forEach((owner, index) => {
    console.log(`${index + 1}.${owner.name}:`);
    cats
      .filter((cat) => owner.id === cat.owner_id)
      .forEach((cat) => console.log(`     <--${cat.name}`));
    client.end();
  });
}

function handleOwners() {
  console.log('displaying owners and their cats');
  const query = 'SELECT owners.id AS owners_id, owners.name AS owners_name, cats.id, cats.name, cats.owner_id FROM owners LEFT JOIN cats on owners.id = cats.owner_id;';
  client.query(query, (errorAtQuery, results) => {
    if (errorAtQuery) {
      console.log('error at query stage =', errorAtQuery);
      client.end();
      return;
    }
    console.log('Results =', results.rows);
    const ownersNamesSet = new Set();

    /* Step 1: Look thru all owners names, get array of Unique names
       * Step 2: Tally, if names In TallyArray, add the cat name.
       * Step 3: if cat.id = null or not found, still display owners name */

    /* use in */
    results.rows.forEach((result) => {
      ownersNamesSet.add(result.owners_name);
    });
    const ownersNamesArr = Array.from(ownersNamesSet);
    const list = {};
    ownersNamesArr.forEach( (owner) => list[owner] = []);
    console.log(list);
    for ( const ownerName in list) {
      results.rows.forEach((result) => {
        if(result.owners_name === ownerName) 
        {  if (result.name === null)
          {list[ownerName].push('no pet cat');}
          else {list[ownerName].push(result.name);}
        }
      });
      
    }
    console.log(list);
    for (const ownerName in list) {
      console.log(`${ownerName}: ${list[ownerName]}`);
    }
    client.end();
  });
};

function handleCats() {
/*   const sqlQuery6 = `SELECT * FROM owners, cats WHERE owners.id = owner_id;`;
  client.query(sqlQuery6, whenQueryDone); */
  console.log('displaying cats and their owners');
  const query = 'SELECT cats.id, cats.name, cats.owner_id, owners.id, owners.name AS owners_name FROM cats FULL JOIN owners on owners.id = cats.owner_id;';
  client.query(query, (errorAtQuery, results) => {
    if (errorAtQuery) {
      console.log('error at query stage=', errorAtQuery);
      client.end();
      return;
    }
    console.log('ownerResults =', results.rows);
/*     ownerResults.rows.forEach((result) => {
      console.log(`${result.id}: ${result.name}, `);
    }); */
    /*   listOwnersWithCats(ownerResults.rows); */
    client.end();
  });



/*  const catsQuery = 'SELECT * FROM cats;';
   client.query(catsQuery, (errorAtCats, catResults) => {
    if (errorAtCats) {
      console.log('error at cats query =', errorAtCats);
      client.end();
      return;
    }
    const ownersQuery = 'SELECT * FROM owners;';
    client.query(ownersQuery, (errorAtOwners, ownerResults) => {
      if (errorAtOwners) {
        console.log('error at owners query =', errorAtOwners);
        client.end();
        return;
      }
      listOwnersWithCats(catResults.rows, ownerResults.rows);
    });
  }); */



}

const command = process.argv[2];
switch (command) {
  case 'all-cats':
    showAllCats();
    break;
  case 'all-owners':
    showAllOwners();
    break;
/*   case 'dropTable':
    const sqlQuery2 = 'DROP TABLE dogs';
    client.query(sqlQuery2, whenQueryDone); */
/*   case 'create-owner':
    const sqlQuery3 = 'CREATE TABLE owners (id SERIAL PRIMARY KEY, name TEXT, type TEXT, weight INTEGER )';
    client.query(sqlQuery3, whenQueryDone); */
  case 'create-owner':
    createOwner();
    break;
  case 'create-cat':
    createCat();
    break;
  case 'owners':
   /*  const sqlQuery6 = `SELECT (owners.name, cats.name) FROM owners INNER JOIN cats ON (owners.id = cats.owner_id);`; */
    handleOwners();
    break;
  case 'cats':
    /*  const sqlQuery6 = `SELECT (owners.name, cats.name) FROM owners INNER JOIN cats ON (owners.id = cats.owner_id);`; */
    handleCats();
    break;
  default:
    console.log('session end');
    break;
}
