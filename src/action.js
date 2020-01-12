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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var github_1 = require("@actions/github");
function isCommitSignedOff(params) {
    var _a, _b, _c, _d, _e, _f, _g;
    return __awaiter(this, void 0, void 0, function () {
        var github, pullRequestData, queryResponse, error_1, latestCommitDateString, reviews, latestCommitDate, countedApprovals, reviewApproves;
        return __generator(this, function (_h) {
            switch (_h.label) {
                case 0:
                    github = new github_1.GitHub(params.token).graphql;
                    pullRequestData = undefined;
                    _h.label = 1;
                case 1:
                    _h.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, github("\n        query ($owner: String!, $repoName: String!, $prNumber: Int!, $approvals: Int!) {\n          repository(owner: $owner, name: $repoName) {\n            pullRequest(number: $prNumber) {\n              commits(last: 1) {\n                nodes {\n                  commit {\n                    committedDate\n                  }\n                }\n              }\n              reviews(last: $approvals) {\n                nodes {\n                  createdAt\n                  state\n                }\n              }\n            }\n          }\n        }\n      ", {
                            owner: params.owner,
                            repoName: params.repo.name,
                            prNumber: params.repo.pr,
                            approvals: params.approvals
                        })];
                case 2:
                    queryResponse = _h.sent();
                    pullRequestData = (_b = (_a = queryResponse) === null || _a === void 0 ? void 0 : _a.repository) === null || _b === void 0 ? void 0 : _b.pullRequest;
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _h.sent();
                    throw new Error("GraphQL request failed: " + error_1.message);
                case 4:
                    latestCommitDateString = (_e = (_d = (_c = pullRequestData) === null || _c === void 0 ? void 0 : _c.commits) === null || _d === void 0 ? void 0 : _d.nodes) === null || _e === void 0 ? void 0 : _e[0].commit.committedDate;
                    reviews = (_g = (_f = pullRequestData) === null || _f === void 0 ? void 0 : _f.reviews) === null || _g === void 0 ? void 0 : _g.nodes;
                    if (latestCommitDateString === undefined || reviews === undefined) {
                        throw new Error('Failure parsing data from GraphQL query response - expected data missing');
                    }
                    latestCommitDate = new Date(latestCommitDateString);
                    countedApprovals = 0;
                    reviewApproves = reviews.filter(function (review) { return review.state === 'APPROVED'; });
                    reviewApproves.forEach(function (review) {
                        var reviewDateString = review.createdAt;
                        if (reviewDateString === undefined) {
                            throw new Error('Failure parsing data from GraphQL query response - expected data missing');
                        }
                        else {
                            var reviewDate = new Date(reviewDateString);
                            if (reviewDate > latestCommitDate) {
                                countedApprovals++;
                            }
                        }
                    });
                    return [2 /*return*/, countedApprovals >= params.approvals];
            }
        });
    });
}
exports.isCommitSignedOff = isCommitSignedOff;
