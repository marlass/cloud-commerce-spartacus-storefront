const fs = require('fs');

const event = JSON.parse(
  fs.readFileSync(process.env.GITHUB_EVENT_PATH, 'utf-8')
);

if (
  event &&
  event.deployment_status &&
  event.deployment_status.state === 'success'
) {
  process.env.DEPLOYMENT_URL = event.deployment_status.target_url;
  process.exit(0);
} else {
  process.exit(1);
}
