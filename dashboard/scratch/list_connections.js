const { AppRunnerClient, ListConnectionsCommand } = require("@aws-sdk/client-apprunner");

async function list() {
  const client = new AppRunnerClient({ region: "us-east-1" }); // Assuming us-east-1
  try {
    const command = new ListConnectionsCommand({});
    const response = await client.send(command);
    console.log(JSON.stringify(response.ConnectionSummaryList, null, 2));
  } catch (err) {
    console.error("Error listing connections:", err.message);
  }
}

list();
