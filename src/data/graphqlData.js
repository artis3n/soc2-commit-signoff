"use strict";
exports.__esModule = true;
exports.OneApprovalMoreRecentThanCommit = {
    data: {
        repository: {
            pullRequest: {
                commits: {
                    nodes: [
                        {
                            commit: {
                                committedDate: '2020-01-11T19:29:52Z'
                            }
                        },
                    ]
                },
                reviews: {
                    nodes: [
                        {
                            createdAt: '2020-01-12T17:10:43Z',
                            state: 'APPROVED'
                        },
                    ]
                }
            }
        }
    }
};
exports.CommitMoreRecentThanApproval = {
    data: {
        repository: {
            pullRequest: {
                commits: {
                    nodes: [
                        {
                            commit: {
                                committedDate: '2020-01-12T17:10:43Z'
                            }
                        },
                    ]
                },
                reviews: {
                    nodes: [
                        {
                            createdAt: '2020-01-11T19:29:52Z',
                            state: 'APPROVED'
                        },
                    ]
                }
            }
        }
    }
};
exports.NoApprovedReviews = {
    data: {
        repository: {
            pullRequest: {
                commits: {
                    nodes: [
                        {
                            commit: {
                                committedDate: '2020-01-11T19:29:52Z'
                            }
                        },
                    ]
                },
                reviews: {
                    nodes: [
                        {
                            createdAt: '2020-01-12T17:10:43Z',
                            state: 'COMMENTED'
                        },
                    ]
                }
            }
        }
    }
};
exports.CommentReviewMoreRecentThanApproval = {
    data: {
        repository: {
            pullRequest: {
                commits: {
                    nodes: [
                        {
                            commit: {
                                committedDate: '2020-01-11T19:29:52Z'
                            }
                        },
                    ]
                },
                reviews: {
                    nodes: [
                        {
                            createdAt: '2020-01-12T17:10:43Z',
                            state: 'APPROVED'
                        },
                        {
                            createdAt: '2020-01-12T19:30:43Z',
                            state: 'COMMENTED'
                        },
                    ]
                }
            }
        }
    }
};
