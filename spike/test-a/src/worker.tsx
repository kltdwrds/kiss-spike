import { render, route } from "rwsdk/router";
import { defineApp } from "rwsdk/worker";
import { Document } from "@/app/Document";
import { Home } from "@/app/pages/Home";
import { About } from "@/app/pages/About";

export default defineApp([
  render(Document, [
    route("/", Home),
    route("/about", About),
  ]),
]);
