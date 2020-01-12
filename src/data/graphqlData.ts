export const OneApprovalMoreRecentThanCommit = {
  data: {
    repository: {
      pullRequest: {
        commits: {
          nodes: [
            {
              commit: {
                committedDate: '2020-01-11T19:29:52Z',
              },
            },
          ],
        },
        reviews: {
          nodes: [
            {
              createdAt: '2020-01-12T17:10:43Z',
              state: 'APPROVED',
            },
          ],
        },
      },
    },
  },
};

export const CommitMoreRecentThanApproval = {
  data: {
    repository: {
      pullRequest: {
        commits: {
          nodes: [
            {
              commit: {
                committedDate: '2020-01-12T17:10:43Z',
              },
            },
          ],
        },
        reviews: {
          nodes: [
            {
              createdAt: '2020-01-11T19:29:52Z',
              state: 'APPROVED',
            },
          ],
        },
      },
    },
  },
};

export const NoApprovedReviews = {
  data: {
    repository: {
      pullRequest: {
        commits: {
          nodes: [
            {
              commit: {
                committedDate: '2020-01-11T19:29:52Z',
              },
            },
          ],
        },
        reviews: {
          nodes: [
            {
              createdAt: '2020-01-12T17:10:43Z',
              state: 'COMMENTED',
            },
          ],
        },
      },
    },
  },
};
