import { useMiniApp } from "@codebolt/miniapp";
import { defineHandler } from "nitro/h3";

export default defineHandler((event) => useMiniApp(event).db.list("leads"));
