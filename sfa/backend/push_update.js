const { execSync } = require("child_process");
const url = process.argv[2];
if (!url) {
  console.log("Error: Please provide the R2 download URL for the APK.");
  console.log("Usage: node push_update.js <R2_DOWNLOAD_URL>");
  process.exit(1);
}

const id = "rel_" + Date.now();
const sql = `INSERT INTO app_releases (id, version_name, version_code, download_url, is_mandatory, release_notes) VALUES ('${id}', '1.0.2', 3, '${url}', 1, 'v1.0.2: Fixed HQ name display on home screen. Fixed DCR editing after final submission.')`;

console.log("Executing SQL on D1...");
try {
  execSync(`npx wrangler d1 execute chikusfa_db --remote --command "${sql}"`, { stdio: "inherit" });
  console.log("Update pushed successfully!");
} catch (e) {
  console.error("Failed to push update.");
}
