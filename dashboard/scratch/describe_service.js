const { AppRunnerClient, DescribeServiceCommand } = require("@aws-sdk/client-apprunner");

async function describe() {
  const client = new AppRunnerClient({ region: "us-east-1" });
  try {
    const command = new DescribeServiceCommand({ ServiceArn: "arn:aws:apprunner:us-east-1:259604218019:service/Pitchside-Analytics/462f9ebf4d8642ce9d0c7306d42816d3" });
    const response = await client.send(command);
    console.log(JSON.stringify(response.Service, null, 2));
  } catch (err) {
    console.error("Error describing service:", err.message);
  }
}

describe();
