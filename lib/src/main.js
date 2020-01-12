"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@actions/core");
const github_1 = require("@actions/github");
const action_1 = require("./action");
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        // This should be a token with access to your repository scoped in as a secret.
        // The YML workflow will need to set token with the GitHub Secret Token
        // myToken: ${{ secrets.GITHUB_TOKEN }}
        // https://help.github.com/en/actions/automating-your-workflow-with-github-actions/authenticating-with-the-github_token#about-the-github_token-secret
        const token = core_1.getInput('token', { required: true });
        const approvals = parseInt(core_1.getInput('approvals') || '1');
        if (isNaN(approvals)) {
            throw new Error('Unable to parse "approvals" input parameter into a number.');
        }
        if (approvals <= 0) {
            throw new Error('Approvals must be greater than or equal to 1. The default is 1.');
        }
        const owner = github_1.context.repo.owner;
        const repoName = github_1.context.repo.repo;
        const isPullRequest = github_1.context.payload.pull_request;
        if (!isPullRequest) {
            throw new Error('This actions only runs against pull request events. Try modifying your workflow trigger.');
        }
        // Format is refs/pull/:prNumber/merge
        // [0]: refs
        // [1]: pull
        // [2]: :prNumber
        // [3]: merge
        const pr_number = parseInt(github_1.context.ref.split('/')[2]);
        const isApproved = yield action_1.isCommitSignedOff({
            token,
            owner,
            repo: {
                name: repoName,
                pr: pr_number,
            },
            approvals,
        });
        if (isApproved) {
            core_1.debug('Approved review exists since the latest commit was added.');
        }
        else {
            core_1.setFailed('No approved review exists since the latest commit was added.');
        }
    });
}
run().catch(error => core_1.setFailed(error));
