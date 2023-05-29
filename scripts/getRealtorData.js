import { spawn } from "child_process";

export default async function ({ state, firstName, lastName }) {
  const payload = JSON.stringify({
    officeStreetCountry: "US",
    officeStreetState: state,
    memberFirstName: firstName,
    memberLastName: lastName,
  });

  console.log(`Sending payload ${payload}`);

  const process = spawn("python3", [
    "./scripts/fetch_realtor_data.py",
    payload,
  ]);

  const response = await new Promise((resolve, reject) => {
    process.stdout.on("data", (data) => {
      resolve(data.toString().trim()); // <------------ by default converts to utf-8
    });
    process.stderr.on("data", reject);
  });

  try {
    if (!response || response === "None") {
      throw new Error("No realtor data found for");
    }

    if (response === "Rejected") {
      throw new Error("Blocked request");
    }

    const json = JSON.parse(response);

    return {
      phoneNumber: json.PreferredPhone,
      emailAddress: json.BusinessEmailAddress,
      officeBusinessName: json.Office.OfficeBusinessName,
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

    return {
      phoneNumber: "",
      emailAddress: "",
      officeBusinessName: "",
    };
  }
}
