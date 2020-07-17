import nock from 'nock';

import { isCommitSignedOff } from '../src/action';

import {
  OneApprovalMoreRecentThanCommit,
  CommitMoreRecentThanApproval,
  NoApprovedReviews,
  CommentReviewMoreRecentThanApproval,
} from '../src/data/graphqlData';

const owner = 'artis3n';
const repo = 'signoff-new-commit';
const githubToken = 'afaketoken';
const pr_number = 1;

/**
 * Get response data for the mocked network calls from https://developer.github.com/v4/explorer/
 * Copy + paste the result object on the right.
 */

/**
 * Sets up nock to mock a web request to GitHub's GraphQL API.
 * @param resultPayload The response payload that nock should return for the GraphQL API.
 */
function mockGraphQLCall(resultPayload: object) {
  return nock('https://api.github.com')
    .post('/graphql')
    .reply(200, resultPayload);
}

describe('Sign off on Commit', () => {
  it('should pass on 1 approval more recent than the last commit', async () => {
    const scope = mockGraphQLCall(OneApprovalMoreRecentThanCommit);

    let result;
    try {
      result = await isCommitSignedOff({
        token: githubToken,
        owner,
        repo: {
          name: repo,
          pr: pr_number,
        },
        approvals: 1,
      });
    } catch (error) {
      expect(error).toBeNull();
    } finally {
      scope.done();
    }

    expect(result).toBeTruthy();
  });

  it('should fail if approved review is older than the latest commit', async () => {
    const scope = mockGraphQLCall(CommitMoreRecentThanApproval);

    let result;
    try {
      result = await isCommitSignedOff({
        token: githubToken,
        owner,
        repo: {
          name: repo,
          pr: pr_number,
        },
        approvals: 1,
      });
    } catch (error) {
      expect(error).toBeNull();
    } finally {
      scope.done();
    }

    expect(result).toBeFalsy();
  });

  it('should fail if no approved review exists', async () => {
    const scope = mockGraphQLCall(NoApprovedReviews);

    let result;
    try {
      result = await isCommitSignedOff({
        token: githubToken,
        owner,
        repo: {
          name: repo,
          pr: pr_number,
        },
        approvals: 1,
      });
    } catch (error) {
      expect(error).toBeNull();
    } finally {
      scope.done();
    }

    expect(result).toBeFalsy();
  });

  it('should fail if not enough approved reviews exist since the latest commit (approvals > 1)', async () => {
    const scope = mockGraphQLCall(OneApprovalMoreRecentThanCommit);

    let result;
    try {
      result = await isCommitSignedOff({
        token: githubToken,
        owner,
        repo: {
          name: repo,
          pr: pr_number,
        },
        approvals: 2,
      });
    } catch (error) {
      expect(error).toBeNull();
    } finally {
      scope.done();
    }

    expect(result).toBeFalsy();
  });

  it('should pass if a PR has enough approvals since the latest commit but COMMENTED reviews are the most recent', async () => {
    const scope = mockGraphQLCall(CommentReviewMoreRecentThanApproval);

    let result;
    try {
      result = await isCommitSignedOff({
        token: githubToken,
        owner,
        repo: {
          name: repo,
          pr: pr_number,
        },
        approvals: 1,
      });
    } catch (error) {
      expect(error).toBeNull();
    } finally {
      scope.done();
    }

    expect(result).toBeTruthy();
  });
});
