import { snapshotApiUrl } from '@/config/snapshot';
import { z, type ZodSchema } from 'zod';

export const ProposalFrontMatterSchema = z.object({
  content: z.string(),
  data: z.object({
    epoch: z.number(),
  }),
});

const createResponseSchema = <T>(schema: ZodSchema<T>) =>
  z.object({
    data: schema,
    errors: z.array(z.object({ message: z.string() })).optional(),
  });

const snapshotApiFetch = async <T>(
  schema: ZodSchema<T>,
  query: string,
  { variables }: { variables: Record<string, unknown> },
) => {
  const responseSchema = createResponseSchema(schema);

  const result = await fetch(`${snapshotApiUrl}/graphql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  if (!result.ok) {
    throw new Error(await result.text());
  }

  const json = responseSchema.parse(await result.json());

  if (!json.data) {
    const { message } = json.errors?.[0] ?? { message: 'Error' };
    throw new Error(message);
  }

  return json.data;
};

const ProposalsSchema = z.object({
  proposals: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      link: z.string(),
      body: z.string(),
      type: z.string(),
      choices: z.array(z.string()),
      scores: z.array(z.number()),
      scores_total: z.number(),
      votes: z.number(),
      start: z.number(),
      end: z.number(),
      snapshot: z.number(),
      state: z.string(),
      author: z.string(),
      space: z.object({
        id: z.string(),
        name: z.string(),
      }),
    }),
  ),
});

export const getProposals = async ({
  space,
  first,
  skip = 0,
}: {
  space: string;
  first: number;
  skip: number;
}) => {
  const data = await snapshotApiFetch(
    ProposalsSchema,
    `
    query getProposals($space: String!, $first: Int!, $skip: Int!) {
      proposals(first: $first, skip: $skip, where: {
        space_in: [$space],
      }, orderBy: "created", orderDirection: desc) {
        id
        title
        body
        link
        type
        choices
        scores
        scores_total
        votes
        start
        end
        snapshot
        state
        author
        space {
          id
          name
        }
      }
    }`,
    {
      variables: {
        space,
        first,
        skip,
      },
    },
  );

  return data.proposals;
};

const VotesSchema = z.object({
  votes: z.array(
    z.object({
      id: z.string(),
      voter: z.string(),
      created: z.number(),
      choice: z.number().or(z.string()),
    }),
  ),
});

export const getVotes = async ({
  queryKey,
}: {
  queryKey: [string, { proposal: string; voter?: string; skip?: number }];
}) => {
  const [, { proposal, voter, skip }] = queryKey;

  const data = await snapshotApiFetch(
    VotesSchema,
    `
    query votes($proposal: String!, $voter: String, $skip: Int) {
      votes(
        first: 1000
        skip: $skip
        where: {
          proposal: $proposal
          voter: $voter
        },
        orderBy: "created"
        orderDirection: desc
      ) {
        id
        voter
        created
        choice
      }
    }
    `,
    {
      variables: {
        proposal,
        voter,
        skip: skip ?? 0,
      },
    },
  );

  return data.votes;
};

const UserVotesSchema = z.object({
  votes: z.array(
    z.object({
      created: z.number(),
      choice: z.number(),
      proposal: z.object({
        id: z.string(),
      }),
    }),
  ),
});

export const getUserVotes = async ({
  queryKey,
}: {
  queryKey: [
    string,
    {
      space: string;
      voter: string;
      proposalIds: string[];
      first: number;
      skip: number;
    },
  ];
}) => {
  const [, { space, voter, proposalIds, first }] = queryKey;

  const data = await snapshotApiFetch(
    UserVotesSchema,
    `
    query votes($space: String!, $voter: String!, $proposalIds: [String!]!, $first: Int!) {
      votes(
        first: $first
        skip: 0
        where: {
          space: $space
          voter: $voter
          proposal_in: $proposalIds
        }
      ) {
        created
        choice
        proposal {
          id
        }
      }
    }
    `,
    {
      variables: { space, voter, proposalIds, first },
    },
  );

  return data.votes;
};
