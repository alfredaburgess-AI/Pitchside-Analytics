const { AppRunnerClient, CreateServiceCommand, DeleteServiceCommand, DescribeServiceCommand } = require("@aws-sdk/client-apprunner");

async function recreate() {
  const client = new AppRunnerClient({ region: "us-east-1" });
  const serviceName = "Pitchside-Analytics";
  
  // Find existing service ARN first
  let existingServiceArn = null;
  try {
    const { ServiceSummaryList } = await client.send(new (require("@aws-sdk/client-apprunner").ListServicesCommand)({}));
    const service = ServiceSummaryList.find(s => s.ServiceName === serviceName);
    if (service) {
      existingServiceArn = service.ServiceArn;
    }
  } catch (err) {
    console.error("Error finding service:", err.message);
  }

  if (existingServiceArn) {
    try {
      console.log("Deleting existing service:", existingServiceArn);
      await client.send(new DeleteServiceCommand({ ServiceArn: existingServiceArn }));
      
      console.log("Waiting for deletion to complete...");
      while (true) {
        try {
          const desc = await client.send(new DescribeServiceCommand({ ServiceArn: existingServiceArn }));
          console.log("Status:", desc.Service.Status);
          if (desc.Service.Status === "DELETED") break;
        } catch (e) {
          if (e.name === "ResourceNotFoundException" || e.message.includes("not found")) {
            console.log("Service successfully removed.");
            break;
          }
          throw e;
        }
        await new Promise(r => setTimeout(r, 10000));
      }
    } catch (err) {
      console.error("Deletion error:", err.message);
    }
  }

  console.log("Creating new service with requested settings...");
  const command = new CreateServiceCommand({
    ServiceName: serviceName,
    SourceConfiguration: {
      CodeRepository: {
        RepositoryUrl: "https://github.com/alfredaburgess-AI/Pitchside-Analytics",
        SourceCodeVersion: {
          Type: "BRANCH",
          Value: "main"
        },
        SourceDirectory: "dashboard", // Requested change
        CodeConfiguration: {
          ConfigurationSource: "API",
          CodeConfigurationValues: {
            Runtime: "NODEJS_22",
            BuildCommand: "npm install && npm run build", // Requested change
            StartCommand: "npm run start -- -p 3000", // Requested change
            Port: "3000", // Requested change
            RuntimeEnvironmentVariables: {
               "GEMINI_API_KEY": process.env.GEMINI_API_KEY || "REPLACE_ME" 
            }
          }
        }
      },
      AuthenticationConfiguration: {
        ConnectionArn: "arn:aws:apprunner:us-east-1:259604218019:connection/adpilot-github-conn-2/1a302b4dd6db4c23b5caebbd164454eb"
      },
      AutoDeploymentsEnabled: true
    },
    InstanceConfiguration: {
      Cpu: "1 vCPU",
      Memory: "2 GB"
    },
    HealthCheckConfiguration: {
      Protocol: "TCP",
      Path: "/",
      Interval: 20,
      Timeout: 5,
      HealthyThreshold: 1,
      UnhealthyThreshold: 5
    }
  });

  try {
    const response = await client.send(command);
    console.log("Service recreation initiated!");
    console.log(JSON.stringify(response.Service, null, 2));
  } catch (err) {
    console.error("Error creating service:", err.message);
  }
}

recreate();
