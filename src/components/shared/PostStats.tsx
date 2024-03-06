import { useDeleteSavedPost, useGetCurrentUser, useLikePost, useSavePost } from "@/lib/react-query/queriesAndMutations"
import { checkIsLiked } from "@/lib/utils"
import { Models } from "appwrite"
import { useEffect, useState } from "react"
import Loader from "./Loader"

type PostStatsProps = {
	post?: Models.Document,
	userId: string
}


const PostStats = ({ post, userId }: PostStatsProps) => {
	const likesList = post.likes.map((user: Models.Document) => user.$id)
	const [likes, setLikes] = useState(likesList)
	const [isSaved, setIsSaved] = useState(false)
	const { mutate: likePost } = useLikePost()
	const { mutate: savePost, isPending: isSavingPost } = useSavePost()
	const { mutate: deleteSavedPost, isPending: isDeletingSaved } = useDeleteSavedPost()
	const { data: currentUser } = useGetCurrentUser();
	const savedPost = currentUser?.save.find((record: Models.Document) => post.$id === record.post.$id)
	useEffect(() => {
		setIsSaved(!!savedPost)
	}, [currentUser]);

	const handleLikePost = (e: React.MouseEvent) => {
		e.stopPropagation();

		let newLikes = [...likes]
		const hasLiked = newLikes.includes(userId);
		if (hasLiked) {
			newLikes = newLikes.filter((id: string) => id !== userId);
		}
		else {
			newLikes.push(userId);
		}
		setLikes(newLikes);
		likePost({ postId: post!.$id, likesArray: newLikes });
	}

	const handleSavePost = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (savedPost) {
			setIsSaved(false);
			deleteSavedPost({ savedId: savedPost.$id });
		}
		else {
			savePost({ postId: post!.$id, userId })
			setIsSaved(true);
		}
	}

	return (
		<div className="z-20 flex items-center justify-between">
			<div className="flex gap-3 mr-5">
				<img
					src={`${checkIsLiked(likes, userId) ? "/assets/icons/liked.svg" : "assets/icons.like.svg"}`}
					alt="like"
					width={20}
					height={20}
					onClick={handleLikePost}
					className="cursor-pointer" />
				<p className="small-medium lg:base-medium">{likes.length}</p>
			</div>
			<div className="flex gap-3">
				{isSavingPost || isDeletingSaved ? <Loader /> : <img
					src={isSaved ? "/assets/icons/saved.svg" : "/assets/icons/save.svg"}
					alt="like"
					width={20}
					height={20}
					onClick={handleSavePost}
					className="cursor-pointer" />}
				<p className="small-medium lg:base-medium">0</p>
			</div>
		</div>
	)
}

export default PostStats
