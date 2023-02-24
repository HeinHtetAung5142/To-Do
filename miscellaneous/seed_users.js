import PQueue from "p-queue";
import { createClient } from "@supabase/supabase-js";
import util from "util";
//Reference on IIFE https://developer.mozilla.org/en-US/docs/Glossary/IIFE
(async function () {
  //Apply your own Supabase project URL and Service Key
  const supabaseUrl = "https://vtucjlmymmpcdqaibwhg.supabase.co";
  const supabaseServiceKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0dWNqbG15bW1wY2RxYWlid2hnIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NjY2OTExNDQsImV4cCI6MTk4MjI2NzE0NH0.bkAcAstHCK9-w_j1aHVZom_RWVGE_IgwndXhlTKG-VQ";

  const supabaseSecret = createClient(supabaseUrl, supabaseServiceKey);
  //console.log(supabaseSecret); I had to do a console.log to check whether the supabaseSecret object was created.

  const users = [
    {
      email: "user1@skills.com",
      password: "password",
      user_metadata: {
        fullname: "USER 1 ASHLEY",
        employee_id: "e0001",
        role: "normal-user",
      },
    },
    {
      email: "user2@skills.com",
      password: "password",
      user_metadata: {
        fullname: "USER 2 AMANDA",
        employee_id: "e0002",
        role: "normal-user",
      },
    },
    {
      email: "user3@skills.com",
      password: "password",
      user_metadata: {
        fullname: "USER 3 AMY",
        employee_id: "e0003",
        role: "normal-user",
      },
    },
  ];

  //Sample code obtained from https://supabase.com/docs/reference/javascript/auth-admin-createuser
  //for reference
  /*const { data, error } = await supabaseSecret.auth.admin.createUser({
    email: 'user@email.com',
    password: 'password',
    data: { name: 'Yoda' }
  })*/

  async function createUsers(users) {
    console.log(`seed_users.js>createUsers method>start`);
    // Create a queue to hold the createUser tasks
    const queue = new PQueue({
      concurrency: 10,
      autoStart: true,
      supabaseSecret,
    });

    // Add the createUser tasks to the queue
    users.forEach((user) => {
      //https://www.javascripttutorial.net/object/javascript-merge-objects/
      queue.add(async () =>
        supabaseSecret.auth.admin.createUser({
          ...user,
          ...{ email_confirm: true },
        })
      );
    });
    //The following emitter command is for learning purpose with
    //no significant role ini this bulk create user logic flow.
    queue.on("completed", (result) => {
      console.log(util.inspect(result));
    });
    // Execute the tasks in the queue
    await queue.onIdle();
  }

  await createUsers(users);
})();
