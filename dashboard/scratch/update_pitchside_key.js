const { AppRunnerClient, UpdateServiceCommand, DescribeServiceCommand } = require("@aws-sdk/client-apprunner");

async function updateKey() {
  const client = new AppRunnerClient({ region: "us-east-1" });
  const serviceArn = "arn:aws:apprunner:us-east-1:259604218019:service/Pitchside-Analytics/462f9ebf4d8642ce9d0c7306d42816d3";
  const geminiKey = "AIzaSyD_puKZP8waM4-dMocffJH1bhnwXBwuSUk";

  try {
    console.log("Describing service to get current configuration...");
    const { Service } = await client.send(new DescribeServiceCommand({ ServiceArn: serviceArn }));
    
    const currentCodeConfig = Service.SourceConfiguration.CodeRepository.CodeConfiguration.CodeConfigurationValues;
    
    console.log("Updating GEMINI_API_KEY and triggering redeploy...");
    const command = new UpdateServiceCommand({
      ServiceArn: serviceArn,
      SourceConfiguration: {
        CodeRepository: {
          RepositoryUrl: Service.SourceConfiguration.CodeRepository.RepositoryUrl,
          SourceCodeVersion: Service.SourceConfiguration.CodeRepository.SourceCodeVersion,
          SourceDirectory: Service.SourceConfiguration.CodeRepository.SourceDirectory,
          CodeConfiguration: {
            ConfigurationSource: "API",
            CodeConfigurationValues: {
              ...currentCodeConfig,
              RuntimeEnvironmentVariables: {
                ...currentCodeConfig.RuntimeEnvironmentVariables,
                "GEMINI_API_KEY": geminiKey
              }
            }
          }
        }
      }
    });

    const response = await client.send(command);
    console.log("Update initiated! New deployment started.");
    console.log("Current Status:", response.Service.Status);
  } catch (err) {
    console.error("Error updating service:", err.message);
  }
}

updateKey();
