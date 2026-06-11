import { displayUpdateNotice } from "~/utils/update-notice";

export async function exit(code?: number, displayUpdate: boolean = true) {
  if (displayUpdate) {
    await displayUpdateNotice();
  }

  await new Promise((resolve) => setTimeout(resolve, 1));
  console.error();
  process.exit(code);
}
