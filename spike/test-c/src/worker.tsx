import { render, route } from "rwsdk/router";
import { defineApp } from "rwsdk/worker";
import { Document } from "@/app/Document";
import { HomePage } from "@/app/pages/HomePage";
import { PostPage } from "@/app/pages/PostPage";
import { NewPostPage } from "@/app/pages/NewPostPage";

export default defineApp([
  render(Document, [
    route("/", HomePage),
    route("/posts/:id", PostPage),
    route("/new", NewPostPage),
  ]),
]);
