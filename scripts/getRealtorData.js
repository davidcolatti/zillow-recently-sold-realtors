import { spawn } from "child_process";

export default async function ({ state, firstName, lastName }) {
  const process = spawn("python3", [
    "./scripts/fetch_realtor_data.py",
    JSON.stringify({
      officeStreetCountry: "US",
      officeStreetState: state,
      memberFirstName: firstName,
      memberLastName: lastName,
    }),
  ]);

  const response = await new Promise((resolve, reject) => {
    process.stdout.on("data", (data) => {
      resolve(data.toString().trim()); // <------------ by default converts to utf-8
    });
    process.stderr.on("data", reject);
  });

  if (!response || response === "None") {
    return null;
  }

  try {
    const json = JSON.parse(response);

    return {
      phoneNumber: json.PreferredPhone,
      emailAddress: json.BusinessEmailAddress,
      officeBusinessName: json.Office.OfficeBusinessName,
    };
  } catch (error) {
    console.log(`No realtor data found for ${{ firstName, lastName, state }}`);
    return {
      phoneNumber: "",
      emailAddress: "",
      officeBusinessName: "",
    };
  }
}
