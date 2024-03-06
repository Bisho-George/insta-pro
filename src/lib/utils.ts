import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

export const formatDate = (dateString: string): string => {
	const currentDate: Date = new Date();
	const inputDate: Date = new Date(dateString);
	const timeDifference: number = currentDate.getTime() - inputDate.getTime();
	const seconds: number = Math.floor(timeDifference / 1000);
	const minutes: number = Math.floor(seconds / 60);
	const hours: number = Math.floor(minutes / 60);
	const days: number = Math.floor(hours / 24);

	if (days > 0) {
		return days === 1 ? '1 day ago' : `${days} days ago`;
	} else if (hours > 0) {
		return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
	} else if (minutes > 0) {
		return minutes === 1 ? '1 minute ago' : `${minutes} minutes ago`;
	} else {
		return 'Just now';
	}
}

export const checkIsLiked = (likeList: string[], userId: string) => {
	return likeList.includes(userId);
};