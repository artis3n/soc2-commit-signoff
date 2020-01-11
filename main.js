import { debug, endGroup, getInput, setFailed, startGroup } from '@actions/core';
import { context, GitHub } from '@actions/github';

async function run() {
  // This should be a token with access to your repository scoped in as a secret.
  // The YML workflow will need to set token with the GitHub Secret Token
  // myToken: ${{ secrets.GITHUB_TOKEN }}
  // https://help.github.com/en/actions/automating-your-workflow-with-github-actions/authenticating-with-the-github_token#about-the-github_token-secret
  const token = getInput('token', { required: true });
  const approvals = parseInt(getInput('approvals') || '1');

  if (isNaN(approvals)) {
    throw new Error('Unable to parse "approvals" input parameter into a number.');
  }

  const isPullRequest = context.payload.pull_request;

  if (!isPullRequest) {
    throw new Error('This actions only runs against pull request events. Try modifying your workflow trigger.');
  }

  // Format is refs/pull/:prNumber/merge
  // [0]: refs
  // [1]: pull
  // [2]: :prNumber
  // [3]: merge
  const pr_number = parseInt(context.ref.split('/')[2]);
  const github = new GitHub(token).graphql;

  let repositoryData = null;
  try {
    // Figure out the GraphQL query at https://developer.github.com/v4/explorer/
    const { repository } = await github(
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
      `, {
        owner: context.repo.owner,
        repoName: context.repo.repo,
        prNumber: pr_number,
        approvals: approvals,
      },
    );

    repositoryData = repository;
  } catch (error) {
    throw new Error(`GraphQL request failed: ${error.message}`);
  }

  // If an error isn't thrown above, we have _something_ in repositoryData
  const latestCommitDate = new Date(repositoryData?.pullRequest?.commits?.nodes[0]?.commit?.committedDate);
  const reviews = repositoryData?.pullRequest?.reviews?.nodes;

  if (latestCommitDate === undefined || reviews === undefined) {
    throw new Error('Failure parsing data from GraphQL query response');
  }

  const reviewApproves = reviews.filter(review => review?.state === 'APPROVED');
  reviewApproves.forEach((review) => {
    const reviewDate = new Date(review?.createdAt);
    if (reviewDate > latestCommitDate) {
      debug('Approved review exists since the latest commit was added.');
    }
  });

  // If we don't exit above, then there is no approved review since the last commit. Fail.
  setFailed('No approved review exists since the latest commit was added.');
}

startGroup('Main code');
run()
  .catch(error => setFailed(error));
endGroup();
