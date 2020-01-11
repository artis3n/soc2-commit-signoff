import { context, GitHub } from '@actions/github';
import nock from 'nock';

const owner = 'artis3n';
const repo = 'signoff-new-commit';

describe('Sign off', () => {
    it('should retrieve the timestamp of the latest commit', async () => {
        const pull_number = 1;
        const github = new GitHub('afaketoken');

        const scope = nock('https://api.github.com')
          .get(`/repos/${owner}/${repo}/pulls/${pull_number}/commits`)
          .reply(200, {});

        const { status } = await github.pulls.listCommits({
            owner,
            repo,
            pull_number,
        });

        scope.done();
        expect(status).toBe(200);
    });

    it('should retrieve the timestamp of the latest review approval', async () => {
        expect(false).toBe(true);
    });

    it('should fail if a commit is newer than the latest approval', async () => {
        expect(false).toBe(true);
    });

    it('should pass if an approval appears after the latest commit', async () => {
        expect(false).toBe(true);
    });

    it('should pass if a pre-selected amount of approvals appears after the latest commit',
        async () => {
        expect(false).toBe(true);
    });

    it('should fail if a commit is newer than a pre-selected number of approvals',
        async () => {
        expect(false).toBe(true);
    });
});
