const { AppRunnerClient, CreateServiceCommand } = require("@aws-sdk/client-apprunner");

async function create() {
  const client = new AppRunnerClient({ region: "us-east-1" });
  const command = new CreateServiceCommand({
    ServiceName: "Pitchside-Analytics",
    SourceConfiguration: {
      CodeRepository: {
        RepositoryUrl: "https://github.com/alfredaburgess-AI/Pitchside-Analytics",
        SourceCodeVersion: {
          Type: "BRANCH",
          Value: "main"
        },
        CodeConfiguration: {
          ConfigurationSource: "API",
          CodeConfigurationValues: {
            Runtime: "NODEJS_22",
            BuildCommand: "npm run build",
            StartCommand: "npm run start -- -p 3000",
            Port: "3000"
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

create();
