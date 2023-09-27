import { readFileSync } from "fs";

// import path from "path";
// import { fileURLToPath } from "url";
// const __dirname = path.dirname(fileURLToPath(import.meta.url));

import filedirname from "filedirname";
const [__filename, __dirname] = filedirname();

export function getRootProjectName(pathToProject: string) {
  const rootProject = JSON.parse(
    readFileSync(`${pathToProject}/package.json`).toString()
  );
  const rootProjectName = rootProject?.name ?? "UNKNOWN";
  return rootProjectName;
}

// return the version string from this module's package.json
export function getCurrentVersionString() {
  const packageJson = JSON.parse(
    readFileSync(`${__dirname}/../../package.json`).toString()
  );
  const version = packageJson?.version ?? "UNKNOWN";
  return version;
}
