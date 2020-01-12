import { debug, getInput, setFailed } from '@actions/core';
import { context } from '@actions/github';

import { isCommitSignedOff } from './action';

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

  if (approvals <= 0) {
    throw new Error('Approvals must be greater than or equal to 1. The default is 1.');
  }

  const owner = context.repo.owner;
  const repoName = context.repo.repo;
  const isPullRequest = context.payload.pull_request;
  if (!isPullRequest) {
    throw new Error(
      'This actions only runs against pull request events. Try modifying your workflow trigger.',
    );
  }

  // Format is refs/pull/:prNumber/merge
  // [0]: refs
  // [1]: pull
  // [2]: :prNumber
  // [3]: merge
  const pr_number = parseInt(context.ref.split('/')[2]);

  const isApproved: boolean = await isCommitSignedOff({
    token,
    owner,
    repo: {
      name: repoName,
      pr: pr_number,
    },
    approvals,
  });

  if (isApproved) {
    debug('Approved review exists since the latest commit was added.');
  } else {
    setFailed('No approved review exists since the latest commit was added.');
  }
}

run().catch(error => setFailed(error));
