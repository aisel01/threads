import ThreadCard from "@/components/cards/ThreadCard";
import { getThread } from "@/lib/actions/thread.actions";
import { getUser } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs";
import { log } from "console";
import { redirect } from "next/navigation";

async function Page({ params }: { params: { id: string } }) {
    if (!params.id) {
        return null;
    }

    const user = await currentUser();

    if (!user) {
        return null;
    }
    
    const userInfo = await getUser(user.id);

    if (!userInfo?.onboarded) {
        redirect('/onboarding');
    }

    const thread = await getThread(params.id);

    log({ thread })
    return (
        <section className="relative">
            <div>
                <ThreadCard
                  id={thread.id}
                  content={thread.text}
                  author={thread.author}
                  createdAt={thread.createdAt}
                  comments={thread.comments}
                  community={thread.community}
                />
            </div>
        </section>
    );
}

export default Page;