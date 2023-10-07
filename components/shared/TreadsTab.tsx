import { getUserPosts } from "@/lib/actions/user.actions";
import { redirect } from "next/navigation";
import ThreadCard from "../cards/ThreadCard";

type TreadsTabProps = {
    accountId: string;
    authUserId: string;
    accountType: 'User';
}

async function TreadsTab(props: TreadsTabProps) {
    const {
        accountId,
        authUserId,
        accountType,
    } = props;


    let userWithThreads = await getUserPosts(accountId);

    if (!userWithThreads) {
        redirect('/');
    }

    return (
        <section className="mt-9 flex flex-col gap-10">
            {userWithThreads.threads.map((thread: any) => {
                return (
                    <ThreadCard 
                        key={thread.id}
                        id={thread.id}
                        content={thread.text}
                        author={{
                            id: userWithThreads.id,
                            name: userWithThreads.name,
                            image: userWithThreads.image,
                        }}
                        createdAt={thread.createdAt}
                        comments={thread.comments}
                        community={thread.community}
                    />
                );
            })}
        </section>
    )

}

export default TreadsTab;