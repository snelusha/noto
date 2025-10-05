export async function readStdin(timeoutMs: number = 5000) {
  return new Promise((resolve, reject) => {
    if (process.stdin.isTTY) return resolve(null);

    let data = "";
    let timeoutId: NodeJS.Timeout;
    let isSettled = false;

    const cleanup = () => {
      clearTimeout(timeoutId);
      process.stdin.pause();
      process.stdin.removeAllListeners("data");
      process.stdin.removeAllListeners("end");
      process.stdin.removeAllListeners("error");
    };

    const settle = (action: () => void) => {
      if (isSettled) return;
      isSettled = true;
      cleanup();
      action();
    };

    timeoutId = setTimeout(() => {
      settle(() => reject(new Error("stdin read timeout exceeded")));
    }, timeoutMs);

    process.stdin.setEncoding("utf-8");

    process.stdin.on("data", (chunk) => {
      data += chunk;
    });

    process.stdin.on("end", () => {
      settle(() => resolve(data));
    });

    process.stdin.on("error", (err) => {
      settle(() => reject(err));
    });

    process.stdin.resume();
  });
}
