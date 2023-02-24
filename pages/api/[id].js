import { supabaseClient } from "../../lib/client";

export default async function ToDo(req, res) {
  const id = req.query.id;

  const { data: todo, error } = await supabaseClient
    .from("todos")
    .update({ status: true })
    .match({ id: id });
  if (error) {
    console.error(error);
  } else {
    console.log("Todo updated successfully");
  }

  res.redirect("/");
}
