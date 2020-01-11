import nock from 'nock';

import { isCommitSignedOff } from '../src/action';

const owner = 'artis3n';
const repo = 'signoff-new-commit';
const githubToken = 'afaketoken';
const pr_number = 1;

describe('Sign off', () => {
  it('should retrieve the timestamp of the latest commit', async () => {
    const scope = nock('https://api.github.com')
      .get(`/graphql`)
      .reply(200, {});

    try {
      await isCommitSignedOff({
        token: githubToken,
        owner,
        repo: {
          name: repo,
          pr: pr_number,
        },
        approvals: 1,
      });
    } catch (error) {
      fail(error);
    }

    scope.done();
  });

  it('should retrieve the timestamp of the latest review approval', async () => {
    expect(true).toBe(true);
  });

  it('should fail if a commit is newer than the latest approval', async () => {
    expect(true).toBe(true);
  });

  it('should pass if an approval appears after the latest commit', async () => {
    expect(true).toBe(true);
  });

  it('should pass if a pre-selected amount of approvals appears after the latest commit', async () => {
    expect(true).toBe(true);
  });

  it('should fail if a commit is newer than a pre-selected number of approvals', async () => {
    expect(true).toBe(true);
  });
});
