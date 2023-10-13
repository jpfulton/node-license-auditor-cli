declare const fail: (message: string) => void;
declare const warn: (message: string) => void;
declare const markdown: (message: string) => void;

import {
  Dependency,
  DependencyOutputter,
  getConfiguration,
  getConfigurationFromUrl,
  getCurrentVersionString,
  getLicensesMarkdown,
} from "@jpfulton/license-auditor-common";
import { findAllLicenses, noLicenses, parseLicenseFactory } from "../auditor";

const repositoryUrl = "https://github.com/jpfulton/node-license-auditor-cli";
const version = getCurrentVersionString();

/**
 * Configuration for the license auditor plugin.
 */
export interface IPluginConfig {
  /** Fail the build on discovery of a blacklisted license */
  failOnBlacklistedLicense: boolean;
  /** Path to the project to audit */
  projectPath: string;
  /** Show the markdown summary */
  showMarkdownSummary: boolean;
  /** Show the markdown details */
  showMarkdownDetails: boolean;
  /** URL to a remote configuration file */
  remoteConfigurationUrl: string;
}

/**
 * DangerJS plugin to audit licenses of dependencies in a project.
 *
 * Default configuration:
 * ```typescript
 * {
 *  failOnBlacklistedLicense: false,
 *  projectPath: ".",
 *  showMarkdownSummary: true,
 *  showMarkdownDetails: true,
 *  remoteConfigurationUrl: "", // empty string means use local configuration
 * }
 * ```
 *
 * @param config Configuration for the plugin. Uses a Partial<IPluginConfig> to allow for partial configuration.
 * @returns Promise<void>
 */
export const licenseAuditor = async (
  config: Partial<IPluginConfig> = {}
): Promise<void> => {
  const {
    failOnBlacklistedLicense = false,
    projectPath = ".",
    showMarkdownSummary = true,
    showMarkdownDetails = true,
    remoteConfigurationUrl = "",
  } = config;

  try {
    const auditorConfig =
      remoteConfigurationUrl !== ""
        ? await getConfigurationFromUrl(remoteConfigurationUrl)
        : await getConfiguration();

    const licenses = await findAllLicenses(projectPath);

    if (!licenses || licenses.length <= 0) {
      return warn(noLicenses);
    }

    const parse = parseLicenseFactory(
      auditorConfig.whiteList,
      auditorConfig.blackList,
      emptyOutputter,
      warnOutputter,
      errorOutputter
    );

    const result = parse(licenses);
    const {
      uniqueCount,
      whitelistedCount,
      warnCount,
      blacklistedCount,
      warnOutputs,
      blackListOutputs,
    } = result;

    if (showMarkdownSummary) {
      markdown("## Dependency License Audit Summary");

      markdown(
        `> :information_source: This summary is generated by \`node-license-auditor-cli\` plugin for DangerJS. <br />
> :information_source: Version: ${version} <br />
> :information_source: Configuration source used: ${auditorConfig.configurationSource} <br />
> :information_source: Configuration source URL: ${auditorConfig.configurationFileName} <br />
> :information_source: For more information, please visit [node-license-auditor-cli](${repositoryUrl}) <br />`
      );

      metadataOutputter(
        uniqueCount,
        whitelistedCount,
        warnCount,
        blacklistedCount
      );

      if (showMarkdownDetails) {
        detailsOutputter([...blackListOutputs, ...warnOutputs]);
      }
    }

    if (warnCount > 0) {
      warn(
        `Found ${warnCount} licenses that we neither whitelisted nor blacklisted by the configuration.`
      );
    }

    if (failOnBlacklistedLicense && blacklistedCount > 0) {
      fail(`Found ${blacklistedCount} blacklisted licenses.`);
    } else if (blacklistedCount > 0) {
      warn(`Found ${blacklistedCount} blacklisted licenses.`);
    }
  } catch (err) {
    fail(
      `[node-license-auditor-cli] Failed to audit licenses with error: ${
        (err as Error).message
      }`
    );
  }
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const emptyOutputter: DependencyOutputter = (_license: Dependency) => {
  return "";
};

const warnOutputter: DependencyOutputter = (license: Dependency) => {
  return markdownOutputter(":yellow_circle:", license);
};

const errorOutputter: DependencyOutputter = (license: Dependency) => {
  return markdownOutputter(":red_circle:", license);
};

const markdownOutputter = (icon: string, dependency: Dependency) => {
  const { name, version } = dependency;
  const licenseString = getLicensesMarkdown(dependency);

  return `| ${icon} | ${name} | ${version} | ${licenseString} |`;
};

export const detailsOutputter = (outputs: string[]) => {
  markdown(`### License Details`);
  markdown(`| Status | Package Name | Version | License |
|---|---|---|---|
${outputs.join("\n")}`);
};

const metadataOutputter = (
  uniqueCount: number,
  whitelistedCount: number,
  warnCount: number,
  blacklistedCount: number
) => {
  const message = `| :hash: Unique Licenses | :green_circle: Whitelisted Licenses | :yellow_circle: Warned Licenses | :red_circle: Blacklisted Licenses |
|---|---|---|---|
| ${uniqueCount} | ${whitelistedCount} | ${warnCount} | ${blacklistedCount} |`;

  markdown(message);
};

export default licenseAuditor;
