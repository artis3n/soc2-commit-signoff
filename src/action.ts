import { PullRequest, SignOffRequest, RepositoryQuery } from './types';
import { getOctokit } from '@actions/github';

export async function isCommitSignedOff(params: SignOffRequest): Promise<boolean> {
  const graphql = getOctokit(params.token).graphql;

  let pullRequestData: PullRequest | undefined = undefined;
  try {
    // Figure out the GraphQL query at https://developer.github.com/v4/explorer/
    const queryResponse: RepositoryQuery = await graphql(
      `
        query($owner: String!, $repoName: String!, $prNumber: Int!, $approvals: Int!) {
          repository(owner: $owner, name: $repoName) {
            pullRequest(number: $prNumber) {
              commits(last: 1) {
                nodes {
                  commit {
                    committedDate
                  }
                }
              }
              reviews(last: $approvals) {
                nodes {
                  createdAt
                  state
                }
              }
            }
          }
        }
      `,
      {
        owner: params.owner,
        repoName: params.repo.name,
        prNumber: params.repo.pr,
        approvals: Math.max(params.approvals, 50),
      },
    );

    console.log(`queryResponse: ${queryResponse}`);
    pullRequestData = queryResponse?.repository?.pullRequest;
  } catch (error) {
    throw new Error(`GraphQL request failed: ${error.message}`);
  }

  const latestCommitDateString = pullRequestData?.commits?.nodes?.[0].commit.committedDate;
  const reviews = pullRequestData?.reviews?.nodes;

  if (latestCommitDateString === undefined || reviews === undefined) {
    throw new Error('Failure parsing data from GraphQL query response - expected data missing');
  }

  const latestCommitDate = new Date(latestCommitDateString);

  let countedApprovals = 0;
  const reviewApproves = reviews.filter(review => review.state === 'APPROVED');
  reviewApproves.forEach(review => {
    const reviewDateString = review.createdAt;
    if (reviewDateString === undefined) {
      throw new Error(
        `Failure parsing data from GraphQL query response - expected createdAt date string, but it is missing: { ${review} }`,
      );
    } else {
      const reviewDate = new Date(reviewDateString);
      if (reviewDate > latestCommitDate) {
        countedApprovals++;
      }
    }
  });

  return countedApprovals >= params.approvals;
}
