#!/usr/bin/env node

import chalk from "chalk";
import { CommanderError, program } from "commander";
import { auditToCsv, auditToMarkdown } from "./commands";

program.description("A CLI for auditing node package licenses.");

program.showHelpAfterError();

program
  .command("csv")
  .argument("<pathToProject>", "Path to project to audit.")
  .option("--no-headers", "Do not write headers to CSV.")
  .option("--no-data", "Do not write data to CSV.")
  .description("Output package license audit to CSV.")
  .action(auditToCsv);

program
  .command("markdown")
  .argument("<pathToProject>", "Path to project to audit.")
  .description("Output package license audit to markdown.")
  .action(auditToMarkdown);

try {
  await program.parseAsync();
} catch (e) {
  // if the error is a derivative of CommanderError
  // respect the suggested exitCode and display the error
  // message in most cases
  if (e instanceof CommanderError) {
    const commanderError = e as CommanderError;

    // suppress the "(output help)" message to console, output others
    if (commanderError.code !== "commander.help") {
      console.log(chalk.red.bold(commanderError.message));
    }

    // exit with the suggested exit code
    process.exit(commanderError.exitCode);
  } else {
    const error = e as Error;

    // this is a hard (unexpected) error
    // output message and stack trace, exiting with error code
    console.error(chalk.red.bold(`Message: ${error.message}`));

    if (error.cause) {
      console.error(chalk.bold.red(`Cause: ${error.cause}`));
    }

    if (error.stack) {
      console.error(chalk.red.bold("Stacktrace:"));
      console.error(chalk.red((error as Error).stack));
    }

    process.exit(1);
  }
}
