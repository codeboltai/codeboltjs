import { useMiniApp } from "@codebolt/miniapp-sdk";
import { defineHandler } from "nitro/h3";

export default defineHandler((event) => useMiniApp(event).db.list("employees"));
