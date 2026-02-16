"use server";

import { env } from "cloudflare:workers";

export async function addTodo(formData: FormData) {
  const title = formData.get("title") as string;
  if (!title?.trim()) return;
  const id = crypto.randomUUID();
  await env.DB.prepare(
    "INSERT INTO todos (id, title, completed, created_at) VALUES (?, ?, 0, ?)"
  ).bind(id, title.trim(), new Date().toISOString()).run();
}

export async function toggleTodo(formData: FormData) {
  const id = formData.get("id") as string;
  const completed = formData.get("completed") === "1" ? 0 : 1;
  await env.DB.prepare("UPDATE todos SET completed = ? WHERE id = ?")
    .bind(completed, id).run();
}

export async function deleteTodo(formData: FormData) {
  const id = formData.get("id") as string;
  await env.DB.prepare("DELETE FROM todos WHERE id = ?").bind(id).run();
}
