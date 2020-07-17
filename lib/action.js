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
const github_1 = require("@actions/github");
function isCommitSignedOff(params) {
    var _a, _b, _c, _d, _e, _f, _g;
    return __awaiter(this, void 0, void 0, function* () {
        const github = new github_1.GitHub(params.token).graphql;
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
                owner: params.owner,
                repoName: params.repo.name,
                prNumber: params.repo.pr,
                approvals: Math.max(params.approvals, 50),
            });
            pullRequestData = (_b = (_a = queryResponse) === null || _a === void 0 ? void 0 : _a.repository) === null || _b === void 0 ? void 0 : _b.pullRequest;
        }
        catch (error) {
            throw new Error(`GraphQL request failed: ${error.message}`);
        }
        const latestCommitDateString = (_e = (_d = (_c = pullRequestData) === null || _c === void 0 ? void 0 : _c.commits) === null || _d === void 0 ? void 0 : _d.nodes) === null || _e === void 0 ? void 0 : _e[0].commit.committedDate;
        const reviews = (_g = (_f = pullRequestData) === null || _f === void 0 ? void 0 : _f.reviews) === null || _g === void 0 ? void 0 : _g.nodes;
        if (latestCommitDateString === undefined || reviews === undefined) {
            throw new Error('Failure parsing data from GraphQL query response - expected data missing');
        }
        const latestCommitDate = new Date(latestCommitDateString);
        let countedApprovals = 0;
        const reviewApproves = reviews.filter(review => review.state === 'APPROVED');
        reviewApproves.forEach(review => {
            const reviewDateString = review.createdAt;
            if (reviewDateString === undefined) {
                throw new Error('Failure parsing data from GraphQL query response - expected createdAt date string, but it is missing: { ${review} }');
            }
            else {
                const reviewDate = new Date(reviewDateString);
                if (reviewDate > latestCommitDate) {
                    countedApprovals++;
                }
            }
        });
        return countedApprovals >= params.approvals;
    });
}
exports.isCommitSignedOff = isCommitSignedOff;
