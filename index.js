import { arrayToCsvFile } from "csv-to-and-from-array";

import getRealtorData from "./scripts/getRealtorData.js";
import getPropertyByZpid from "./scripts/getPropertyByZpid.js";
import getRecentlySoldHomes from "./scripts/getRecentlySoldHomes.js";

// Find list of recently sold homes by using zillow url slug (check their website)
const zpids = await getRecentlySoldHomes("san-diego-ca");

console.log(`Total ZPIDs found ${zpids.length}`);

// Use zpids that were scraped from recently sold homes to get property data
const response = await Promise.all(zpids.map(getPropertyByZpid));
const data = response.filter(Boolean);

for (let i = 0; i < data.length; i++) {
  const { state, buyerAgentName } = data[i];
  const splitname = buyerAgentName.split(" ");
  const firstName = splitname[0];
  const lastName = splitname[splitname.length - 1];

  const { phoneNumber, emailAddress, officeBusinessName } =
    (await getRealtorData({
      state,
      firstName,
      lastName,
    })) ?? {};

  data[i].phoneNumber = phoneNumber;
  data[i].emailAddress = emailAddress;
  data[i].officeBusinessName = officeBusinessName;

  arrayToCsvFile({
    data,
    filePath: "./output.csv",
    callback: () => console.log(`Scraped ${buyerAgentName}`),
  });
}
