const { AppRunnerClient, ListServicesCommand } = require("@aws-sdk/client-apprunner");

async function findService() {
  const client = new AppRunnerClient({ region: "us-east-1" });
  try {
    const command = new ListServicesCommand({});
    const response = await client.send(command);
    const service = response.ServiceSummaryList.find(s => s.ServiceName === "Pitchside-Analytics");
    if (service) {
      console.log(JSON.stringify(service, null, 2));
    } else {
      console.log("Service not found.");
    }
  } catch (err) {
    console.error("Error finding service:", err.message);
  }
}

findService();
