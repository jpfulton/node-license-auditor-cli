import { readFileSync } from "fs";

// import path from "path";
// import { fileURLToPath } from "url";
// const __dirname = path.dirname(fileURLToPath(import.meta.url));

import filedirname from "filedirname";
const [__filename, __dirname] = filedirname();

export const templates: Record<string, string> = {
  [readFileSync(
    `${__dirname}/../auditor/templates/BSD-2-Clause.txt`
  ).toString()]: "BSD 2-Clause",
  [readFileSync(`${__dirname}/../auditor/templates/MIT.txt`).toString()]: "MIT",
};

export const licenseMap: Record<string, string> = {
  "(The MIT License)": "MIT",
  "Apache License": "Apache",
  "ISC License": "ISC",
  "MIT License": "MIT",
  "The ISC License": "ISC",
  "The MIT License (MIT)": "MIT",
  "The MIT License (MIT)^M": "MIT",
  "The MIT License": "MIT",
  "This software is released under the MIT license:": "MIT",
};

export const licenseFiles = [
  "LICENSE",
  "LICENCE",
  "LICENSE.md",
  "LICENCE.md",
  "LICENSE.txt",
  "LICENSE-MIT",
  "LICENSE.BSD",
];

export const readmeFiles = ["README", "README.md", "README.markdown"];
