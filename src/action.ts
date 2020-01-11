import { PullRequest, SignOffRequest } from './types';
import { GitHub } from '@actions/github';

export async function isCommitSignedOff(params: SignOffRequest) {
  const github = new GitHub(params.token).graphql;

  let pullRequestData: PullRequest | undefined = undefined;
  try {
    // Figure out the GraphQL query at https://developer.github.com/v4/explorer/
    const queryResponse = await github(
      `
        query ($owner: String!, $repoName: String!, $prNumber: Int!, $approvals: Int!) {
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
        approvals: params.approvals,
      },
    );

    pullRequestData = queryResponse?.repository?.pullRequest;
  } catch (error) {
    throw new Error(`GraphQL request failed: ${error.message}`);
  }

  const latestCommitDateString = pullRequestData?.commits?.nodes?.[0]?.commit?.committedDate;
  const reviews = pullRequestData?.reviews?.nodes;

  if (latestCommitDateString === undefined || reviews === undefined) {
    throw new Error('Failure parsing data from GraphQL query response');
  }

  const latestCommitDate = new Date(latestCommitDateString);

  let passed = false;

  const reviewApproves = reviews.filter(review => review?.review?.state === 'APPROVED');
  reviewApproves.forEach(review => {
    const reviewDateString = review?.review?.createdAt;
    if (reviewDateString === undefined) {
      throw new Error('Failure parsing data from GraphQL query response');
    } else {
      const reviewDate = new Date(reviewDateString);
      if (reviewDate > latestCommitDate) {
        passed = true;
      }
    }
  });

  if (!passed) {
    throw new Error('No approved review exists since the latest commit was added.');
  }
}
