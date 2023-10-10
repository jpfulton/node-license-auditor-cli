import { LicenseOutputter, MetadataOutputter } from "../util";
import { findAllLicenses } from "./licenseChecker.js";
import { noLicenses, noPathSpecified } from "./messages.js";
import parseLicensesFactory from "./parseLicenses.js";

const checkLicenses = async (
  whitelistedLicenses: string[],
  blacklistedLicenses: string[],
  projectPath: string,
  metadataOutputter: MetadataOutputter,
  infoOutputter: LicenseOutputter,
  warnOutputter: LicenseOutputter,
  errorOutputter: LicenseOutputter
) => {
  if (!projectPath) {
    return console.error(noPathSpecified);
  }

  try {
    const licenses = await findAllLicenses(projectPath);

    if (!licenses || licenses.length <= 0) {
      return console.error(noLicenses);
    }

    const parse = parseLicensesFactory(
      whitelistedLicenses,
      blacklistedLicenses,
      infoOutputter,
      warnOutputter,
      errorOutputter
    );

    const result = parse(licenses);
    const {
      uniqueCount,
      whitelistedCount,
      warnCount,
      blacklistedCount,
      blackListOutputs,
      warnOutputs,
      whiteListOutputs,
    } = result;

    metadataOutputter(
      uniqueCount,
      whitelistedCount,
      warnCount,
      blacklistedCount
    );

    const outputs = [...blackListOutputs, ...warnOutputs, ...whiteListOutputs];
    outputs.forEach((output) => console.log(output));
  } catch (err) {
    console.error((err as Error).message);
  }
};

export default checkLicenses;
