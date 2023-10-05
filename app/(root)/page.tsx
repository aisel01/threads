import ThreadCard from "@/components/cards/ThreadCard";
import { getThreads } from "@/lib/actions/thread.actions";

async function Page() {
  const { threads, hasNext } = await getThreads();

  console.log({threads, hasNext });

  return (
    <>
      <h1 className="head-text text-left">Home</h1>
      <section className='mt-9 flex flex-col gap-10'>
        {threads.length === 0 ? (
          <p className='no-result'>No threads found</p>
        ) : (
          <>
            {threads.map(thread => {
              return (
                <ThreadCard
                  key={thread.id}
                  id={thread.id}
                  content={thread.text}
                  author={thread.author}
                  createdAt={thread.createdAt}
                  comments={thread.comments}
                  community={thread.community}
                />
              );
            })}
          </>
        )}
      </section>
    </>
  )
}

export default Page;
