import { arrayToCsvFile } from "csv-to-and-from-array";
import getRealtorData from "./scripts/getRealtorData.js";
import getPropertyByZpid from "./scripts/getPropertyByZpid.js";
import getRecentlySoldHomes from "./scripts/getRecentlySoldHomes.js";

// Find list of recently sold homes by using zillow url slug (check their website)
const homes = await getRecentlySoldHomes("san-diego-ca");

console.log(homes);
console.log(`Total homes found ${homes.length}`);

// Use zpids that were scraped from recently sold homes to get property data
const response = await Promise.all(
  homes.map(async (home) => {
    if (!home.zpid) return {};

    const buyerData = await getPropertyByZpid(home.zpid);
    return {
      ...home,
      ...buyerData,
    };
  })
);

const buyers = response.filter((r) => !!r.buyerAgentName);

console.log(buyers);
console.log(`Total buyers found ${buyers.length}`);

for (let i = 0; i < buyers.length; i++) {
  const { state, buyerAgentName } = buyers[i];
  const splitname = buyerAgentName.split(" ");
  const firstName = splitname[0];
  const lastName = splitname[splitname.length - 1];

  const { phoneNumber, emailAddress, officeBusinessName } =
    (await getRealtorData({
      state,
      firstName,
      lastName,
    })) ?? {};

  buyers[i].phoneNumber = phoneNumber;
  buyers[i].emailAddress = emailAddress;
  buyers[i].officeBusinessName = officeBusinessName;

  arrayToCsvFile({
    data: buyers,
    filePath: "./output.csv",
    callback: () => console.log(`Scraped ${buyerAgentName}`),
  });
}
