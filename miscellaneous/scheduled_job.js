const { createClient } = require("@supabase/supabase-js");
const { DateTime } = require("luxon");
const SibApiV3Sdk = require("sib-api-v3-sdk");
const cron = require("node-cron");

const express = require("express");
const app = express.Router();

// Initialize Supabase client
const supabaseUrl = "https://vtucjlmymmpcdqaibwhg.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0dWNqbG15bW1wY2RxYWlid2hnIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NjY2OTExNDQsImV4cCI6MTk4MjI2NzE0NH0.bkAcAstHCK9-w_j1aHVZom_RWVGE_IgwndXhlTKG-VQ";
const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize Sendinblue client
const defaultClient = SibApiV3Sdk.ApiClient.instance;
var apiKey = defaultClient.authentications["api-key"];
apiKey.apiKey =
  "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";

var api = new SibApiV3Sdk.AccountApi();
api.getAccount().then(
  function (data) {
    console.log("API called successfully. Returned data: " + data);
  },
  function (error) {
    console.error(error);
  }
);

const calculateTimeDiff = (end) => {
  let checkTimeLeft = false;
  const start = DateTime.now();

  const startDateTime = DateTime.fromISO(start);
  const endDateTime = DateTime.fromISO(end);
  const duration = endDateTime.diff(startDateTime, ["hours"]);

  const timeLeft = duration.toObject();

  if (timeLeft.hours < 24) {
    checkTimeLeft = true;
  }

  return checkTimeLeft;
};

async function checkDates() {
  const { data: todos, error } = await supabase
    .from("todos")
    .select("id, name, starts_at, ends_at")
    .order("id", { ascending: true });

  if (error) {
    console.error(error);
    return;
  }

  console.log(
    "----------------------- First Test: Check Dates -----------------------"
  );

  // Loop through each todo record
  todos.forEach((todo) => {
    // Check if the start date is earlier than the end date
    if (new Date(todo.starts_at) < new Date(todo.ends_at)) {
      // Do nothing if the start date is earlier than the end date
      console.log(`Todo "${todo.name}" has valid dates`);
    } else {
      // Perform the necessary action if the start date is later than the end date
      console.log(`Todo "${todo.name}" has invalid dates`);
    }
  });
}

async function checkDuration() {
  const { data: todos, error } = await supabase
    .from("todos")
    .select("id, name, starts_at, ends_at")
    .order("id", { ascending: true });

  if (error) {
    console.error(error);
    return;
  }

  console.log(
    "----------------------- Second Test: Check Deadline -----------------------"
  );

  // Loop through each todo record
  todos.forEach((todo) => {
    // Check if the duration is less than 24 hours
    if (calculateTimeDiff(todo.ends_at) === true) {
      // Do nothing if the start date is earlier than the end date
      console.log(`Todo "${todo.name}" ends in less than 24 hours`);

      sendEmailNotification(todo);
    } else {
      // Perform the necessary action if the start date is later than the end date
      console.log(`Todo "${todo.name}" ends in more than 24 hours`);
    }
  });
}

async function sendEmailNotification(todo) {
  const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
  const endDate = DateTime.fromISO(todo.ends_at).toLocaleString();
  console.log(todo.id);
  const link = `http://localhost:3000/api/${todo.id}`;
  let email = new SibApiV3Sdk.SendSmtpEmail();

  email.to = [{ email: "thelazyking111@gmail.com", name: "Butning" }];
  email.sender = { email: "hhaung5142@gmail.com", name: "TODO" };
  email.subject = `Todo "${todo.name}" ends in 24 hours`;
  email.htmlContent = `<html>Dear BUTNING <br /><br /> The todo "${todo.name}" is scheduled to end ${endDate}. <br /> <br /> <a href=${link}>Mark it as completed</a></html>`;

  apiInstance.sendTransacEmail(email).then(
    function (data) {
      console.log("Email sent successfully. Returned data: " + data);
    },
    function (error) {
      console.error(error);
    }
  );

  // TO-DO
  // Add a link to the email that allows the user to mark the todo as completed
  // How to do it:
  // Send it as a link with the todo id as a query parameter
  // Create a page that will handle the request and mark the todo as completed
  // e.g: <a href="/?todoId=1">Mark it as completed</a>
}

// Asterisk is based on clock timing
// e.g: "* 0 8 * * *" means 8:00 AM every day
// "* * * * * *"
//  | | | | | |
//  | | | | | |
//  | | | | | day of week
//  | | | | month
//  | | | day of month
//  | | hour
//  | minute
//  second(optional)
// Testing
// Schedule the checkTodoDates function to run every day at 8:00 AM
const checkDatesTask = cron.schedule("* 8 * * *", () => {
  checkDates();
});

const checkDurationTask = cron.schedule("* 8 * * *", () => {
  checkDuration();
});

checkDatesTask.start();
checkDurationTask.start();
