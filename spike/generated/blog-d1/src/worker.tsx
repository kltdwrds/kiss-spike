import { render, route } from "rwsdk/router";
import { defineApp } from "rwsdk/worker";
import { Document } from "@/app/Document";
import { Home } from "@/app/pages/Home";
import { PostPage } from "@/app/pages/PostPage";
import { AdminPage } from "@/app/pages/AdminPage";

export type AppContext = {};

export default defineApp([
  render(Document, [
    route("/", Home),
    route("/posts/:id", PostPage),
    route("/admin", AdminPage),
  ]),
]);