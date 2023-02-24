const { createClient } = require("@supabase/supabase-js");
const [DateTime] = require("luxon");
const { v4: uuidv4 } = require("uuid");
const faker = require("faker");

// Define the Supabase connection
const supabaseUrl = "https://vtucjlmymmpcdqaibwhg.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0dWNqbG15bW1wY2RxYWlid2hnIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NjY2OTExNDQsImV4cCI6MTk4MjI2NzE0NH0.bkAcAstHCK9-w_j1aHVZom_RWVGE_IgwndXhlTKG-VQ";
const supabase = createClient(supabaseUrl, supabaseKey);

// Define the table name
const tableName = "todos";

// Define the table columns
const tableColumns = [
  { name: "id", type: "int4", primaryKey: true },
  { name: "name", type: "varchar" },
  { name: "starts_at", type: "timestamptz" },
  { name: "ends_at", type: "timestamptz" },
  { name: "created_at", type: "timestamp", defaultValue: "now()" },
  { name: "updated_at", type: "timestamp", defaultValue: "now()" },
];

// Define the seed data
const seedData = Array.from({ length: 10 }, (_, i) => {
  const startDate = DateTime.local()
    .plus({ days: faker.datatype.number({ min: 0, max: 90 }) })
    .toJSDate();
  const endDate = DateTime.local()
    .plus({ days: faker.datatype.number({ min: 91, max: 180 }) })
    .toJSDate();

  return {
    title: faker.lorem.sentence(),
    description: faker.lorem.sentences(),
    project_start_date_time: startDate,
    project_end_date_time: endDate,
  };
});

// Seed the database
async function seedDatabase() {
  // Check if the table exists, and create it if it doesn't
  const { data: tables, error } = await supabase
    .from("information_schema.tables")
    .select("*")
    .eq("table_name", tableName);
  if (error) {
    console.error(error);
    return;
  }
  if (tables.length === 0) {
    const { data: createdTable, error: createTableError } = await supabase.rpc(
      "create_table",
      { tableName, tableColumns }
    );
    if (createTableError) {
      console.error(createTableError);
      return;
    }
    console.log(`Created the ${tableName} table.`);
  }

  // Seed the table
  const { data: seededData, error: seedError } = await supabase
    .from(tableName)
    .insert(seedData);
  if (seedError) {
    console.error(seedError);
    return;
  }
  console.log(`Seeded ${seededData.length} rows to the ${tableName} table.`);
}

seedDatabase();
