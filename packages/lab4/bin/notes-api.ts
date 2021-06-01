#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "@aws-cdk/core";
import { NotesApiStack } from "../lib/notes-api-stack";
import { NotesFrontendStack } from "../lib/notes-frontend-stack";

const app = new cdk.App();
new NotesApiStack(app, "NotesApiStack");
new NotesFrontendStack(app, "NotesFrontendStack", {
  apiEndpoint: process.env.API_ENDPOINT!
});