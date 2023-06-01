import {
  executeCommand,
  getRealtorCommand,
  getSearchCommand,
} from "./commands.js";

const sleep = () => new Promise((resolve) => setTimeout(() => resolve(), 5000));

export default async function ({ state, firstName, lastName }) {
  let attemptCount = 1;
  while (attemptCount <= 5) {
    try {
      const response = await executeCommand(
        getSearchCommand({ state, firstName, lastName })
      );

      if (!response || response?.length === 0) {
        throw new Error(`No realtor found from search`);
      }

      const [{ PersonId: personId }] = response;

      if (!personId) {
        throw new Error("No personId is found");
      }

      const { PreferredPhone, BusinessEmailAddress, Office } =
        await executeCommand(getRealtorCommand({ personId, lastName }));

      return {
        phoneNumber: PreferredPhone,
        emailAddress: BusinessEmailAddress,
        officeBusinessName: Office.OfficeBusinessName,
      };
    } catch (error) {
      console.log(
        `${JSON.stringify({
          firstName,
          lastName,
          state,
        })} | `,
        error.message
      );
    }

    console.log(
      `Retrying, sleeping for 5 seconds | attempt count ${attemptCount} | ${JSON.stringify(
        { state, firstName, lastName }
      )}`
    );
    await sleep();
    attemptCount++;
  }
}
