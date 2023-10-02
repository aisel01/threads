import { getThreads } from "@/lib/actions/thread.actions";

async function Page() {
  const { threads, hasNext } = await getThreads();

  console.log({threads, hasNext });

  return (
    <>
      <h1 className="head-text text-left">Home</h1>
      {threads.map(thread => {
        return (
          <div
            className="text-light-2"
            key={thread.author}
          >
            {thread.text}
          </div>
        );
      })}
    </>
  )
}

export default Page;
