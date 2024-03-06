import { INewPost, INewUser, IUpdatePost } from "@/types"
import { ID, Query } from 'appwrite';
import { account, appwriteConfig, databases, storage } from "./config";
import { avatars } from "./config";

export const createUserAccount = async (user: INewUser) => {
	try {
		const newAccount = await account.create(
			ID.unique(),
			user.email,
			user.password,
			user.name
		)

		if (!newAccount) {
			throw Error;
		}
		const avatarUrl = avatars.getInitials(user.name);
		const newUser = await saveUserToDB({
			accountId: newAccount.$id,
			name: newAccount.name,
			email: newAccount.email,
			username: user.username,
			imageUrl: avatarUrl,
		})

		return newUser;
	} catch (error) {
		console.log(error);
		return error

	}
}

export const saveUserToDB = async (user: {
	accountId: string,
	email: string,
	name: string,
	imageUrl: URL,
	username?: string
}) => {
	try {
		const newUser = await databases.createDocument(
			appwriteConfig.databaseId,
			appwriteConfig.userCollectionId,
			ID.unique(),
			user
		)

		return newUser;
	} catch (error) {
		console.log(error);

	}
}

export const signIn = async (user: { email: string, password: string }) => {
	try {
		const session = await account.createEmailSession(user.email, user.password);
		return session;
	} catch (error) {
		console.log(error);
	}
}

export const getCurrentUser = async () => {
	try {
		const currentAccount = await account.get();
		if (!currentAccount) {
			throw Error
		}
		const currentUser = await databases.listDocuments(
			appwriteConfig.databaseId,
			appwriteConfig.userCollectionId,
			[
				Query.equal('accountId', currentAccount.$id)
			]
		)
		if (!currentUser) {
			console.log(currentUser);
			throw Error('Failed to get the current user.');
		}

		return currentUser.documents[0]
	} catch (error) {
		console.log(error);

	}
}

export const signOut = async () => {
	try {
		const session = await account.deleteSession('current')
		return session;
	} catch (error) {
		console.log(error);

	}
}

export const createPost = async (post: INewPost) => {
	try {
		const uploadedFile = await uploadFile(post.file[0]);
		if (!uploadedFile) {
			throw Error;
		}
		const fileUrl = getFilePreview(uploadedFile.$id)
		if (!fileUrl) {
			deleteFile(uploadedFile.$id);
			throw Error
		}
		const tags = post.tags?.replace(/ /g, '').split(',') || []

		const newPost = await databases.createDocument(
			appwriteConfig.databaseId,
			appwriteConfig.postCollectionId,
			ID.unique(),
			{
				creator: post.userId,
				caption: post.caption,
				imageUrl: fileUrl,
				imageId: uploadedFile?.$id,
				location: post.location,
				tags
			}
		)
		if (!newPost) {
			await deleteFile(uploadedFile.$id);
			throw Error
		}

		return newPost
	} catch (error) {
		console.log(error);

	}
}

export const getRecentPosts = async () => {
	const recentPosts = await databases.listDocuments(
		appwriteConfig.databaseId,
		appwriteConfig.postCollectionId,
		[Query.orderDesc('$createdAt'), Query.limit(20)]
	)
	if (!recentPosts) {
		throw Error;
	}
	return recentPosts;
}

export const uploadFile = async (file: File) => {
	try {
		const uploadedFile = await storage.createFile(
			appwriteConfig.storageId,
			ID.unique(),
			file
		)
		return uploadedFile;
	} catch (error) {
		console.log(error);

	}
}

export const getFilePreview = (fileId: string) => {
	try {
		const fileUrl = storage.getFilePreview(appwriteConfig.storageId, fileId, 2000, 2000,
			"top", 100)
		return fileUrl;
	} catch (error) {
		console.log(error);

	}
}

export const deleteFile = async (fileId: string) => {
	try {
		await storage.deleteFile(
			appwriteConfig.storageId,
			fileId
		)
		return { status: 'ok' }
	} catch (error) {
		console.log(error);

	}
}

export const likePost = async (postId: string, likesArray: string[]) => {
	try {
		const updatedPost = await databases.updateDocument(
			appwriteConfig.databaseId,
			appwriteConfig.postCollectionId,
			postId,
			{
				likes: likesArray
			}
		)
		if (!updatedPost) {
			throw Error;
		}
		return updatedPost;
	} catch (error) {
		console.log(error);

	}
}

export const savePost = async (postId: string, userId: string) => {
	try {
		const updatedPost = await databases.createDocument(
			appwriteConfig.databaseId,
			appwriteConfig.savesCollectionId,
			ID.unique(),
			{
				user: userId,
				post: postId
			}
		)
		if (!updatedPost) {
			throw Error;
		}
		return updatedPost;
	} catch (error) {
		console.log(error);

	}
}
export const deleteSavedPost = async (savedId: string) => {
	try {
		const statusCode = await databases.deleteDocument(appwriteConfig.databaseId,
			appwriteConfig.savesCollectionId, savedId)
		if (!statusCode) {
			throw Error;
		}
		return { status: "ok" }
	} catch (error) {
		console.log(error);

	}
}

export const getPostById = async (postId: string) => {
	try {
		const post = await databases.getDocument(
			appwriteConfig.databaseId,
			appwriteConfig.postCollectionId,
			postId
		)
		if (!post) {
			throw Error;
		}
		return post;

	} catch (error) {
		console.log(error);

	}
}

export const updatePost = async (post: IUpdatePost) => {
	const hasFileToUpdate = post.file.length > 0
	try {
		let image = {
			imageUrl: post.imageUrl,
			imageId: post.imageId,
		}
		if (hasFileToUpdate) {
			// Upload image to storage
			const uploadedFile = await uploadFile(post.file[0]);
			if (!uploadedFile) {
				throw Error;
			}
			// Get file url
			const fileUrl = getFilePreview(uploadedFile.$id)
			if (!fileUrl) {
				deleteFile(uploadedFile.$id);
				throw Error
			}
			image = { ...image, imageUrl: fileUrl, imageId: uploadedFile.$id }
		}
		// Convert tags to Array
		const tags = post.tags?.replace(/ /g, '').split(',') || []

		const updatedPost = await databases.updateDocument(
			appwriteConfig.databaseId,
			appwriteConfig.postCollectionId,
			post.postId,
			{
				caption: post.caption,
				imageUrl: image?.imageUrl,
				imageId: image?.imageId,
				location: post.location,
				tags
			}
		)
		if (!updatedPost) {
			await deleteFile(image?.imageId);
			throw Error
		}

		return updatedPost;
	} catch (error) {
		console.log(error);

	}
}

export const deletePost = async (postId: string, imageId: string) => {
	if (!postId || !imageId) throw Error;
	try {
		await databases.deleteDocument(appwriteConfig.databaseId,
			appwriteConfig.postCollectionId,
			postId
		)
		return { status: 'ok' }
	} catch (error) {
		console.log(error);

	}
}