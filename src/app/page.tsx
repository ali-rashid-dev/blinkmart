import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

type UserWithPosts = {
  id: number;
  name: string | null;
  email: string;
  posts: Array<{
    id: number;
    title: string;
    content: string | null;
    published: boolean;
  }>;
};

export default async function Home() {
  const users: UserWithPosts[] = await prisma.user.findMany({
    include: { posts: true },
    orderBy: { id: "asc" },
  });

  return (
    <div className="min-h-screen bg-zinc-50 px-6 py-12 text-zinc-900 dark:bg-black dark:text-zinc-100">
      <main className="mx-auto flex max-w-5xl flex-col gap-8">
        <header className="space-y-3">
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-zinc-500">
            Prisma + Next.js
          </p>
          <h1 className="text-3xl font-semibold sm:text-4xl">
            Seeded data from your PostgreSQL database
          </h1>
          <p className="max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
            The home page is now reading users and posts directly from Prisma so the seeded content is visible in the app.
          </p>
        </header>

        <section className="grid gap-6 md:grid-cols-2">
          {users.map((user) => (
            <article
              key={user.id}
              className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold">{user.name ?? "Unnamed user"}</h2>
                  <p className="text-sm text-zinc-500">{user.email}</p>
                </div>
                <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                  {user.posts.length} posts
                </span>
              </div>

              <ul className="space-y-3">
                {user.posts.map((post: UserWithPosts["posts"][number]) => (
                  <li key={post.id} className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-medium">{post.title}</h3>
                      <span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${post.published ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"}`}>
                        {post.published ? "Published" : "Draft"}
                      </span>
                    </div>
                    {post.content ? (
                      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{post.content}</p>
                    ) : null}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
