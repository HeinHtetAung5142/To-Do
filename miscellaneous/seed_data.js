const { createClient } = require("@supabase/supabase-js");
const { faker } = require("@faker-js/faker");
const { Pool } = require("pg");
const { DateTime } = require("luxon");

// Initialize the Supabase client with your Supabase URL and API key
const supabaseUrl = "https://vtucjlmymmpcdqaibwhg.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0dWNqbG15bW1wY2RxYWlid2hnIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NjY2OTExNDQsImV4cCI6MTk4MjI2NzE0NH0.bkAcAstHCK9-w_j1aHVZom_RWVGE_IgwndXhlTKG-VQ";
const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize the PostgreSQL client with your database connection string
const connectionString =
  "postgresql://postgres:U6gkjU1yhapqUQGN@db.vtucjlmymmpcdqaibwhg.supabase.co:5432/postgres";
const pool = new Pool({ connectionString });

// Define the table name and fields
const tableName = "todos";
const tableFields = {
  id: "SERIAL PRIMARY KEY",
  name: "VARCHAR NOT NULL",
  starts_at: "TIMESTAMPTZ NOT NULL",
  ends_at: "TIMESTAMPTZ NOT NULL",
  created_at: "TIMESTAMPTZ NOT NULL DEFAULT NOW()",
  updated_at: "TIMESTAMPTZ NOT NULL DEFAULT NOW()",
};

const generateToDos = () => {
  const name = faker.word.verb({
    length: { min: 5, max: 12 },
    strategy: "fail",
  });
  const starts_at = DateTime.local()
    .plus({
      days: faker.datatype.number({ min: 0, max: 30 }),
    })
    .toISO();
  const ends_at = DateTime.local()
    .plus({
      days: faker.datatype.number({ min: 31, max: 60 }),
    })
    .toISO();

  return { name, starts_at, ends_at };
};

// Define some example data to seed the table with
const seedToDos = async () => {
  const todos = [];

  for (let i = 0; i < 5; i++) {
    todos.push(generateToDos());
  }

  return todos;
};

// Define the function to clear and create the table and seed it with data
const resetTable = async () => {
  // Clear the table by dropping it if it exists
  await pool.query(`DROP TABLE IF EXISTS ${tableName}`);

  // Create the table with the defined fields
  await pool.query(
    `CREATE TABLE ${tableName} (${Object.entries(tableFields)
      .map(([name, type]) => `${name} ${type}`)
      .join(", ")})`
  );

  const todos = await seedToDos();

  // Seed the table with data
  const { data, error } = await supabase.from(tableName).insert(todos);
  if (error) {
    console.error(error);
  } else {
    console.log("Data inserted successfully!");
    // console.log(`Inserted ${data.length} rows into ${tableName}`);
  }
};

// Call the function to clear and create the table and seed it with data
resetTable();
