import { getUserPosts } from '@/lib/actions/user.actions';
import { redirect } from 'next/navigation';
import ThreadCard from '../cards/ThreadCard/ThreadCard';
import { fetchCommunityPosts } from '@/lib/actions/community.actions';

type TreadsTabProps = {
    authUserId: string;
    accountId: string;
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
                return (
                    <ThreadCard
                        key={thread.id}
                        id={thread.id}
                        currentUserId={authUserId}
                        content={thread.text}
                        author={
                            accountType === 'User'
                                ? { name: result.name,
                                    image: result.image,
                                    id: result.id,
                                    username: result.username,
                                }
                                : {
                                    name: thread.author.name,
                                    username: thread.author.username,
                                    image: thread.author.image,
                                    id: thread.author.id,
                                }
                        }
                        community={
                            accountType === 'Community'
                                ? { name: result.name, id: result.id, image: result.image }
                                : thread.community
                        }
                        createdAt={thread.createdAt}
                        comments={thread.children}
                        likes={thread.likes}
                        showReplyPics={thread.children.length > 0}
                        canDelete={authUserId === (accountType === 'Community' ? thread.author.id : result.id)}
                    />
                );
            })}
        </section>
    );

}

export default TreadsTab;