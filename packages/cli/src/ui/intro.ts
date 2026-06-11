import { bgBlack, bgCyan, bgGreen, black } from "@crustjs/style";

import { isPrerelease } from "~/utils/installation-info";

export function renderIntro() {
  console.error();
  if (isPrerelease) {
    console.error(bgGreen(black(" @snelusha/noto [Prerelease] ")));
    return;
  }

  console.error(bgCyan(black(" @snelusha/noto ")));
}
