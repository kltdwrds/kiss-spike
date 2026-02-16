"use server";

import { env } from "cloudflare:workers";

export async function createPost(formData: FormData) {
  const title = formData.get("title") as string;
  const body = formData.get("body") as string;
  
  if (!title || !body) {
    throw new Error("Title and body are required");
  }
  
  const id = crypto.randomUUID();
  const published_at = new Date().toISOString();
  
  await env.DB.prepare(
    "INSERT INTO posts (id, title, body, published_at) VALUES (?, ?, ?, ?)"
  )
    .bind(id, title.trim(), body.trim(), published_at)
    .run();
    
  return { success: true, id };
}