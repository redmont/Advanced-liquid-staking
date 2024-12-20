import fs from 'fs';
import csv from 'csv-parser';
import { promisify } from 'util';
import stream from 'stream';
import { z } from 'zod';

const ClaimSchema = z.object({
  address: z.string(),
  amount: z.string(),
});

const pipeline = promisify(stream.pipeline);

export const readClaims = async () => {
  const results: z.infer<typeof ClaimSchema>[] = [];

  await pipeline(
    fs.createReadStream('./src/server/claims.csv'),
    csv({}),
    async function* (source) {
      for await (const data of source) {
        results.push(ClaimSchema.parse(data));
      }
    },
  );

  return results;
};

export const findClaim = async (addresses: string[]) => {
  const claims = await readClaims();
  return claims.filter((claim) => addresses.includes(claim.address));
};
