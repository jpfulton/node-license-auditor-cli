import * as fs from "node:fs";

import eslint from "@seadub/danger-plugin-eslint";
import { danger, warn } from "danger";
import jest from "danger-plugin-jest";
import yarn from "danger-plugin-yarn";

import { licenseAuditor } from "./dist/cjs/danger";

export default async () => {
  if (!danger.github) {
    return;
  }

  // No PR is too small to include a description of why you made a change
  if (danger.github.pr.body.length < 10) {
    warn("Please include a description of your PR changes.");
  }

  // Request changes to src also include changes to tests.
  const allFiles = danger.git.modified_files.concat(danger.git.created_files);
  const hasAppChanges = allFiles.some((p) => p.includes("src/"));
  const hasTestChanges = allFiles.some((p) => p.includes("tests/"));

  if (hasAppChanges && !hasTestChanges) {
    warn(
      "This PR does not include changes to tests, even though it affects app code."
    );
  }

  // Run Jest Plugin
  jest();

  // Run ESLint Plugin
  const eslintConfig = fs.readFileSync(".eslintrc.json", "utf8").toString();
  await eslint(eslintConfig, [".ts", ".tsx"]);

  // Run Yarn Plugin
  await yarn();

  // Run License Auditor Plugin from local source
  await licenseAuditor({
    failOnBlacklistedLicense: false,
    projectPath: ".",
    remoteConfigurationUrl:
      "https://raw.githubusercontent.com/jpfulton/jpfulton-license-audits/main/.license-checker.json",
    showMarkdownSummary: true,
    showMarkdownDetails: true,
  });
};
