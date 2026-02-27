const esbuild = require("esbuild");
const fs = require("fs");
const path = require("path");

const lambdasDir = path.join(__dirname, "lambda_functions");
const outDir = path.join(__dirname, "dist");
// const lambdaNameMap = {
//   update_tasks: "update_task",
//   delete_tasks: "delete_task",
// };

// Make sure dist folder exists
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

fs.readdirSync(lambdasDir).forEach((lambdaName) => {
  const lambdaPath = path.join(lambdasDir, lambdaName, "index.js");
  const outputName = lambdaName;
  const outputPath = path.join(outDir, `${outputName}.zip`);

  esbuild.build({
    entryPoints: [lambdaPath],
    bundle: true,
    platform: "node",
    target: "node18",
    outfile: path.join(outDir, `${outputName}.js`), // temporary JS before zip
    external: [], // leave empty to bundle SDK v3 & uuid
  }).then(() => {
    // Zip the bundled file
    const { execSync } = require("child_process");
    execSync(`zip -j ${outputPath} ${path.join(outDir, `${outputName}.js`)}`);
    fs.unlinkSync(path.join(outDir, `${outputName}.js`)); // remove temp JS
    console.log(`Built Lambda: ${outputName} -> ${outputPath}`);
  }).catch((err) => {
    console.error(err);
  });
});
