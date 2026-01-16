const exec = require("child_process").execSync;
console.log(
  `cross-env NODE_ENV=${process.env.ENV_NODE} uni ${
    process.env.SERVEOR_BUILD === "dev" ? "" : "build"
  } -p ${process.env.UNIAPP_PLATFORM} --mode ${process.env.OPTION_FILE}`
);
exec(
  `cross-env NODE_ENV=${process.env.ENV_NODE} uni ${
    process.env.SERVEOR_BUILD === "dev" ? "" : "build"
  } -p ${process.env.UNIAPP_PLATFORM} --mode ${process.env.OPTION_FILE}`,
  { stdio: "inherit" }
);
