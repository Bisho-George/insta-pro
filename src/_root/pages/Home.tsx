import Loader from "@/components/shared/Loader";
import PostCard from "@/components/shared/PostCard";
import { useGetRecentPosts } from "@/lib/react-query/queriesAndMutations";
import { Models } from "appwrite";

const Home = () => {
	const {data: recentPosts, isLoading: isPostsLoading, isError: isErrorPosts} = useGetRecentPosts()
	return (
		<div className="flex flex-1">
			<div className="home-container">
				<div className="home-posts">
					<h2 className="w-full text-left h3-bold md:h2-bold">Home Feed</h2>
					{isPostsLoading && !recentPosts ?(
						<Loader />
					): (
						<ul className="flex flex-col flex-1 w-full gap-9">
							{recentPosts?.documents.map((post: Models.Document) => (
								<PostCard key={post.caption} post={post}/>
							))}
						</ul>
					)}
				</div>
			</div>
		</div>
	)
}

export default Home
