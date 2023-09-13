import { open, writeFile, appendFile, access, constants } from "fs/promises";
import { resolve } from "path";
import { MailCreator } from "./CSVMailCreator";
import { NaverSMTP } from "./NodeMailerNaverSMTP";
import { incrementalFileNaming } from "../../utils";
import { stringify } from "csv/sync";

// -------------------------------------------------------------------------- //
// Parse arguments
// -------------------------------------------------------------------------- //

let SOURCE_FILE_PATH: string | undefined
let OUTPUT_FILE_PATH: string | undefined
let LOG_FILE_PATH: string | undefined
let VERBOSE: boolean = false
let SEND: boolean = false

for (const arg of process.argv.slice(2)) {
  switch (true) {
    case /--send/.test(arg):
      SEND = true;
      continue;

    case /-i=(.*)|--input=(.*)/.test(arg):
      const foo = /(-i|--input)=(.*)/.exec(arg);
      SOURCE_FILE_PATH = foo?.at(2);
      continue;

    case /-o=(.*)|--output=(.*)/.test(arg):
      OUTPUT_FILE_PATH = /-o=(.*)|--output=(.*)/.exec(arg)?.at(1)
      continue;

    case /-o=(.*)|--output=(.*)/.test(arg):
      LOG_FILE_PATH = /-l=(.*)|--log=(.*)/.exec(arg)?.at(1)
      continue;

    case /-v|--verbose/.test(arg):
      VERBOSE = true;
      continue;

    default:
      console.error("Illegal argument ", arg)
  }
}

async function main() {

  // ------------------------------------------------------------------------ //
  // Parse source file
  // ------------------------------------------------------------------------ //
  if (SOURCE_FILE_PATH === undefined) {
    console.error('Source csv file must be provided.');
    process.exit(1);
  }

  try {
    await access(SOURCE_FILE_PATH, constants.R_OK | constants.W_OK)
  } catch (error) {
    console.error(`Source csv file ${SOURCE_FILE_PATH} doesn't exist.`);
    process.exit(1);
  }
  
  const mailCreator = new MailCreator();
  await mailCreator.parseCSV(SOURCE_FILE_PATH);
  // console.log(mailCreator.CSVDataTyped);

  // ------------------------------------------------------------------------ //
  // Create mail contents
  // ------------------------------------------------------------------------ //
  // mailCreator.createMailOptions ('jwseo94@naver.com', 'wareh@hanmail.net');
  // mailCreator.createMailOptions ('jwseo94@naver.com', 'jan9won@gmail.com');
  mailCreator.createMailOptions();

  // ------------------------------------------------------------------------ //
  // Write mail options to the output file (if flag is given)
  // ------------------------------------------------------------------------ //
  if (OUTPUT_FILE_PATH !== undefined) {
    const serializedMailOptions = mailCreator.serializeMailOptionsToCSV();
    const uniqueOutputFilePath = await incrementalFileNaming.create(resolve(OUTPUT_FILE_PATH));
    try {
      console.log (`Writing CSV file to ${uniqueOutputFilePath}`);
      await writeFile(uniqueOutputFilePath, serializedMailOptions)
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
  }

  // ------------------------------------------------------------------------ //
  // send email
  // ------------------------------------------------------------------------ //

  if (SEND === true) {
    // prepare SMTP transport
    // const naverSMTP = new NaverSMTP('jwseo94', 'jw10010kkk', true);
    const naverSMTP = new NaverSMTP('buwoncbw', 'buwon1151', true);

    // verify SMTP server 
    const verificationResult = await naverSMTP.verify();
    if (verificationResult !== true){
      console.error(verificationResult);
      process.exit(1);
    }

    // prepare log file path
    let LogFile;
    if (LOG_FILE_PATH === undefined) {
      LOG_FILE_PATH = `${__dirname}/sendMailLog.csv`;
    } else {
      LOG_FILE_PATH = `${LOG_FILE_PATH}/sendMailLog.csv`;
    }
    LOG_FILE_PATH = await incrementalFileNaming.create(LOG_FILE_PATH);
    try {
      LogFile = await open (LOG_FILE_PATH, 'w');
      await access (LOG_FILE_PATH);
    } catch (e) {
      console.error(e);
      console.error(`Failed to access log file path ${LOG_FILE_PATH}`);
      process.exit(1);
    }

    // send
    for (let i = 0; i < mailCreator.MailOptions.length; i++) {
      const mailOption = mailCreator.MailOptions[i];
      // ================================================================== //
      const sendResult = await naverSMTP.send(mailOption)
      // ================================================================== //
      LogFile.appendFile (
        stringify ([
          [
            mailOption.to,
            sendResult instanceof Error ? 'X' : 'O',
            mailOption.subject,
            mailOption.text,
            sendResult,
          ]
        ],
        {
          columns: [
            { key: 'to' },
            { key: 'success' },
            { key: 'subject' },
            { key: 'text' },
            { key: 'errorMessage' },
          ]
        })
      );
    }
  }
}

main();
