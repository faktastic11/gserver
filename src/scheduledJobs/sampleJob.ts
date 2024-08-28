import cron from "node-cron";

const sampleFn = () => console.log("this job runs every hour");

export async function runSampleJob() {
  // sampleFn()

  cron.schedule("0 * * * *", async () => sampleFn);
}
