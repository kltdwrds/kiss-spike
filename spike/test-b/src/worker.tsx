import { render, route } from "rwsdk/router";
import { defineApp } from "rwsdk/worker";
import { Document } from "@/app/Document";
import { TodoPage } from "@/app/pages/TodoPage";

export default defineApp([
  render(Document, [
    route("/", TodoPage),
  ]),
]);
