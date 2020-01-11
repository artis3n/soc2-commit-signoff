type CommitNode = {
  commit?: {
    committedDate?: string;
  };
};

type ReviewNode = {
  review?: {
    createdAt: string;
    state: string;
  };
};

type Commit = {
  nodes?: Array<CommitNode>;
};

type Review = {
  nodes?: Array<ReviewNode>;
};

export type PullRequest = {
  commits?: Commit;
  reviews?: Review;
};

export type SignOffRequest = {
  token: string;
  owner: string;
  repo: {
    name: string;
    pr: number;
  }
  approvals: number;
}
