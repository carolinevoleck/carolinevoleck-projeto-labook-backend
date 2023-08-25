export class LikeDislike {
    constructor(
        private user_id: string,
        private post_id: string,
        private like: number,
    ) {}

    getUserId(): string {
        return this.user_id
    }

    setUserId(value: string): void {
        this.user_id = value
    }

    getPostId(): string {
        return this.post_id
    }

    setPostId(value: string): void {
        this.post_id = value
    }

    getLike(): number {
        return this.like
    }

    setLike(value: number): void {
        this.like = value
    }
}