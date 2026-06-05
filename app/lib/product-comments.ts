import type { ProductComment } from "./types";

const COMMENTS_BY_PRODUCT: Record<string, ProductComment[]> = {
  "1": [
    {
      id: "c1",
      author: "@devdan",
      body: "Finally a changelog tool that doesn't feel like an afterthought. The weekly digest emails are gorgeous.",
      createdAt: "2h ago",
      likes: 12,
      replies: [
        {
          id: "c1-r1",
          author: "@lena_k",
          body: "Thanks! We spent a lot of time on the email templates — glad it's paying off.",
          createdAt: "1h ago",
          likes: 6,
          replies: [
            {
              id: "c1-r1-r1",
              author: "@devdan",
              body: "The mobile layout especially — most changelog emails are unreadable on phone.",
              createdAt: "45m ago",
              likes: 3,
            },
          ],
        },
        {
          id: "c1-r2",
          author: "@tom_v",
          body: "Does it support custom domains for the digest subdomain?",
          createdAt: "50m ago",
          likes: 2,
          replies: [
            {
              id: "c1-r2-r1",
              author: "@lena_k",
              body: "Yes — Pro plan includes custom domain + white-label footer.",
              createdAt: "30m ago",
              likes: 4,
            },
          ],
        },
      ],
    },
    {
      id: "c2",
      author: "@priya_s",
      body: "We switched from a Notion page to OrbitKit last month — open rates on updates went from 9% to 41%.",
      createdAt: "5h ago",
      likes: 8,
      replies: [
        {
          id: "c2-r1",
          author: "@sara_m",
          body: "That's a huge jump. Did you change anything else or just the delivery format?",
          createdAt: "4h ago",
          likes: 2,
          replies: [
            {
              id: "c2-r1-r1",
              author: "@priya_s",
              body: "Just OrbitKit — same content, better packaging and a proper unsubscribe flow.",
              createdAt: "3h ago",
              likes: 5,
            },
          ],
        },
      ],
    },
    {
      id: "c3",
      author: "@marcusdev",
      body: "Love the API. Took 20 minutes to wire into our release pipeline.",
      createdAt: "1d ago",
      likes: 5,
    },
  ],
  "2": [
    {
      id: "c4",
      author: "@joel_r",
      body: "Rollback in production without waking up the on-call team. This should be standard everywhere.",
      createdAt: "3h ago",
      likes: 9,
      replies: [
        {
          id: "c4-r1",
          author: "@marcusdev",
          body: "The audit trail alone saved us during our last SOC2 review.",
          createdAt: "2h ago",
          likes: 4,
        },
      ],
    },
    {
      id: "c5",
      author: "@annika",
      body: "Clean UI and the audit log is exactly what compliance asked for.",
      createdAt: "8h ago",
      likes: 4,
    },
  ],
};

const DEFAULT_COMMENTS: ProductComment[] = [
  {
    id: "default-1",
    author: "@founder",
    body: "Really impressed with the polish here. Excited to see where this goes.",
    createdAt: "1d ago",
    likes: 3,
    replies: [
      {
        id: "default-1-r1",
        author: "@builder",
        body: "Same here — the onboarding flow is super smooth.",
        createdAt: "20h ago",
        likes: 1,
      },
    ],
  },
  {
    id: "default-2",
    author: "@builder",
    body: "Solid launch — the problem statement resonates. Rooting for the team.",
    createdAt: "2d ago",
    likes: 2,
  },
];

export function getProductComments(productId: string): ProductComment[] {
  return COMMENTS_BY_PRODUCT[productId] ?? DEFAULT_COMMENTS;
}
