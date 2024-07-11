const checkEnvVariables = () => {
  const requiredVariables = [
    "uri",
    "port",
    "jwt",
    "jwtexpire",
    "emailhost",
    "emailport",
    "emailname",
    "emailpassword",
  ];
  const missingVariables = requiredVariables.filter(
    (variable) => !process.env[variable]
  );

  if (missingVariables.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVariables.join(", ")}`
    );
  }
};

export default checkEnvVariables;
