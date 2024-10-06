// Copyright 2023-2025 ProjectPlanton.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import * as core from "@actions/core";
import * as io from "@actions/io";
import { getProjectPlanton } from "./project-planton";
import { Error, isError } from "./error";

export async function run(): Promise<void> {
  try {
    const result = await runSetup();
    if (result !== null && isError(result)) {
      core.setFailed(result.message);
    }
  } catch (error) {
    if (isError(error)) {
      core.setFailed(error.message);
      return;
    }
    core.setFailed("Internal error");
  }
}

async function runSetup(): Promise<null | Error> {
  const version = core.getInput("version");
  if (version === "") {
    return {
      message: "A version was not provided",
    };
  }

  core.info(`Setting up ProjectPlanton CLI version "${version}"`);
  const installDir = await getProjectPlanton(version);
  if (isError(installDir)) {
    return installDir;
  }

  core.info("Adding ProjectPlanton cli to PATH");
  core.addPath(installDir);

  const binaryPath = await io.which("project-planton", true);
  if (binaryPath === "") {
    return {
      message: "project-planton cli was not found on PATH",
    };
  }

  core.info(`Successfully installed project-planton cli version ${version}`);
  return null;
}
