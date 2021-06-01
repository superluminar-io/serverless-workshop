#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { NotesApiStack } from '../lib/notes-api-stack';

const app = new cdk.App();
new NotesApiStack(app, 'NotesApiStack');
