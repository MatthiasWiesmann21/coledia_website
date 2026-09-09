import { databaseErrorCode } from "./service";

export async function retryTransaction<T>(
  work: () => Promise<T>,
  pause: (attempt: number) => Promise<void> = (attempt) =>
    new Promise((resolve) => setTimeout(resolve, 25 * 2 ** attempt)),
): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await work();
    } catch (error) {
      if (databaseErrorCode(error) !== "P2034" || attempt >= 2) throw error;
      await pause(attempt);
    }
  }
}
