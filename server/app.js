// Express server code
const express = require("express");
const scheduledJobs = require("./cron_job");
const app = express();

scheduledJobs.runCronJobs();

// Route to handle marking a todo as complete
app.get("/:id", async (req, res) => {
  const { data: todo, error } = await supabase
    .from("todos")
    .update({ status: true })
    .match({ id: req.params.id })
    .single();

  if (error) {
    console.error(error);
    return res.status(500).send("Error updating todo");
  }

  return res.send("Todo updated successfully");
});
