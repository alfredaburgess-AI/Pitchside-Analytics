const { AppRunnerClient, DeleteServiceCommand, DescribeServiceCommand } = require("@aws-sdk/client-apprunner");

async function deleteService() {
  const client = new AppRunnerClient({ region: "us-east-1" });
  const serviceArn = "arn:aws:apprunner:us-east-1:259604218019:service/Pitchside-Analytics/0851b08546fb403c8ac32e7ecc6f6766";
  
  try {
    console.log("Initiating deletion of:", serviceArn);
    await client.send(new DeleteServiceCommand({ ServiceArn: serviceArn }));
    console.log("Deletion initiated. Waiting for service to be removed...");
    
    // Poll for deletion
    while (true) {
      try {
        const desc = await client.send(new DescribeServiceCommand({ ServiceArn: serviceArn }));
        console.log("Current Status:", desc.Service.Status);
        if (desc.Service.Status === "DELETED") break;
      } catch (err) {
        if (err.name === "ResourceNotFoundException" || err.message.includes("not found")) {
          console.log("Service successfully removed (not found).");
          break;
        }
        throw err;
      }
      await new Promise(r => setTimeout(r, 10000)); // Wait 10s
    }
  } catch (err) {
    console.error("Error during deletion:", err.message);
  }
}

deleteService();
