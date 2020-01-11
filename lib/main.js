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
require("reflect-metadata");
const core_1 = require("@actions/core");
const github_1 = require("@actions/github");
function run() {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
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
        const github = new github_1.GitHub(token).graphql;
        let pullRequestData = undefined;
        try {
            // Figure out the GraphQL query at https://developer.github.com/v4/explorer/
            const queryResponse = yield github(`
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
                owner: github_1.context.repo.owner,
                repoName: github_1.context.repo.repo,
                prNumber: pr_number,
                approvals: approvals,
            });
            pullRequestData = (_b = (_a = queryResponse) === null || _a === void 0 ? void 0 : _a.repository) === null || _b === void 0 ? void 0 : _b.pullRequest;
        }
        catch (error) {
            throw new Error(`GraphQL request failed: ${error.message}`);
        }
        const latestCommitDateString = (_g = (_f = (_e = (_d = (_c = pullRequestData) === null || _c === void 0 ? void 0 : _c.commits) === null || _d === void 0 ? void 0 : _d.nodes) === null || _e === void 0 ? void 0 : _e[0]) === null || _f === void 0 ? void 0 : _f.commit) === null || _g === void 0 ? void 0 : _g.committedDate;
        const reviews = (_j = (_h = pullRequestData) === null || _h === void 0 ? void 0 : _h.reviews) === null || _j === void 0 ? void 0 : _j.nodes;
        if (latestCommitDateString === undefined || reviews === undefined) {
            throw new Error('Failure parsing data from GraphQL query response');
        }
        const latestCommitDate = new Date(latestCommitDateString);
        let passed = false;
        const reviewApproves = reviews.filter(review => { var _a, _b; return ((_b = (_a = review) === null || _a === void 0 ? void 0 : _a.review) === null || _b === void 0 ? void 0 : _b.state) === 'APPROVED'; });
        reviewApproves.forEach(review => {
            var _a, _b;
            const reviewDateString = (_b = (_a = review) === null || _a === void 0 ? void 0 : _a.review) === null || _b === void 0 ? void 0 : _b.createdAt;
            if (reviewDateString === undefined) {
                throw new Error('Failure parsing data from GraphQL query response');
            }
            const reviewDate = new Date(reviewDateString);
            if (reviewDate > latestCommitDate) {
                core_1.debug('Approved review exists since the latest commit was added.');
                passed = true;
            }
        });
        if (!passed) {
            throw new Error('No approved review exists since the latest commit was added.');
        }
    });
}
run().catch(error => core_1.setFailed(error));
