"use server";

import { env } from "cloudflare:workers";

export async function createPost(formData: FormData) {
  const title = formData.get("title") as string;
  const body = formData.get("body") as string;
  if (!title?.trim() || !body?.trim()) return;
  const id = crypto.randomUUID();
  await env.DB.prepare(
    "INSERT INTO posts (id, title, body, created_at) VALUES (?, ?, ?, ?)"
  ).bind(id, title.trim(), body.trim(), new Date().toISOString()).run();
  return Response.redirect(`/posts/${id}`, 303);
}
