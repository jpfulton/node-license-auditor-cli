import licenseAuditor from "../auditor/checkLicenses.js";
import { License } from "../models/license.js";
import getConfiguration from "../util/configuration.js";
import {
  getCurrentVersionString,
  getRootProjectName,
} from "../util/root-project.js";

export async function auditToMarkdown(pathToProject: string): Promise<void> {
  const rootProjectName = getRootProjectName(pathToProject);
  const version = getCurrentVersionString();
  const configuration = await getConfiguration();

  console.log(`# Package Dependencies Audit Report: ${rootProjectName}`);
  console.log("");

  console.log(`> Generated at ${new Date().toUTCString()} <br />`);
  console.log(
    `> Generated using version ${version} of node-license-auditor-cli.`
  );
  console.log(
    `> Configuration source used: ${configuration.configurationSource}`
  );
  console.log("");

  licenseAuditor(
    configuration.whiteList,
    configuration.blackList,
    pathToProject,
    metadataMarkdown,
    infoMarkdown,
    warnMarkdown,
    errorMarkdown
  ).then(() => console.log(""));
}

const metadataMarkdown = (
  uniqueCount: number,
  whitelistedCount: number,
  warnCount: number,
  blacklistedCount: number
) => {
  console.log(`## Metadata`);
  console.log(
    `| :hash: Unique Licenses | :green_circle: Whitelisted Licenses | :yellow_circle: Warned Licenses | :red_circle: Blacklisted Licenses |`
  );
  console.log(`|---|---|---|---|`);
  console.log(
    `| ${uniqueCount} | ${whitelistedCount} | ${warnCount} | ${blacklistedCount} |`
  );
  console.log("");

  markdownTableHeader();
};

const infoMarkdown = (licenseObj: License) => {
  return markdown(":green_circle:", licenseObj);
};

const warnMarkdown = (licenseObj: License) => {
  return markdown(":yellow_circle:", licenseObj);
};

const errorMarkdown = (licenseObj: License) => {
  return markdown(":red_circle:", licenseObj);
};

const markdown = (icon: string, licenseItem: License): string => {
  return `| ${icon} 
| ${licenseItem.name} 
| ${licenseItem.version} 
| ${licenseItem.licenses} 
| ${licenseItem.publisher ?? ""} 
| ${licenseItem.email ?? ""} 
| ${licenseItem.repository ?? ""} 
| ${licenseItem.path} 
| ${licenseItem.licensePath} |`.replaceAll("\n", ""); // Remove newlines from the license text
};

const markdownTableHeader = () => {
  console.log("## Licenses");
  console.log("");
  console.log(
    "|  | NAME | VERSION | LICENSE | PUBLISHER | EMAIL | REPOSITORY | MODULE PATH | LICENSE PATH |"
  );
  console.log("|---|---|---|---|---|---|---|---|---|");
};
