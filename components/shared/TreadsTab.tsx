import { getUserPosts } from "@/lib/actions/user.actions";
import { redirect } from "next/navigation";
import ThreadCard from "../cards/ThreadCard";
import { fetchCommunityPosts } from "@/lib/actions/community.actions";

type TreadsTabProps = {
    accountId: string;
    authUserId: string;
    accountType: 'User' | 'Community';
}

async function TreadsTab(props: TreadsTabProps) {
    const {
        accountId,
        authUserId,
        accountType,
    } = props;

    let result: any;

    if (accountType == 'Community') {
        result = await fetchCommunityPosts(accountId);
    } else {
        result = await getUserPosts(accountId);
    }

    if (!result) {
        redirect('/');
    }

    
    return (
        <section className="mt-9 flex flex-col gap-10">
            {result.threads.map((thread: any) => {
            console.log({ thread });
                return (
                    <ThreadCard 
                        key={thread.id}
                        id={thread.id}
                        content={thread.text}
                        author={
                        accountType === "User"
                            ? { name: result.name, image: result.image, id: result.id }
                            : {
                                name: thread.author.name,
                                image: thread.author.image,
                                id: thread.author.id,
                            }
                        }
                        community={
                        accountType === "Community"
                            ? { name: result.name, id: result.id, image: result.image }
                            : thread.community
                        }
                        createdAt={thread.createdAt}
                        comments={thread.comments}
                    />
                );
            })}
        </section>
    )

}

export default TreadsTab;