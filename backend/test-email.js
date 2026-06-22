import { sendRegistrationPendingEmailToStudent } from "./src/utils/email.js";

async function run() {
  console.log("Testing email...");
  await sendRegistrationPendingEmailToStudent("Test Student", "aayunibarot@gmail.com");
  console.log("Done.");
}

run();
