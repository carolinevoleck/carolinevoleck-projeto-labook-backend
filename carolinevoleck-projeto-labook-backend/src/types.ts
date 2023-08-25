export enum ROLES {
    NORMAL = "NORMAL",
    ADMIN = "ADMIN"
}

export interface UserDB {
    id: string,
    name: string,
    email: string,
    password: string,
    role: ROLES,
    created_at: string 
}

export interface UserModel {
    id: string,
    name: string,
    email: string,
    password: string,
    role: ROLES,
    createdAt: string
}

export interface PostDB {
    id: string, 
    creator_id: string,
    content: string, 
    likes: number,
    dislikes: number,
    created_at: string, 
    updated_at: string 
}

export interface PostCreatorDB extends PostDB{
    name: string
}

export interface PostModel {
    id: string,
    content: string,
    likes: number,
    dislikes: number,
    createdAt: string,
    updatedAt: string,
    creator: {
        id: string
        name: string
    }
}

export interface likeDislikeDB {
    user_id: string,
    post_id: string,
    like: boolean
}

export enum POST_LIKE {
    ALREADY_LIKED = "ALREADY LIKED",
    ALREADY_DISLIKED = "ALREADY DISLIKED"
}

export interface UpdatePostDB {
    content: string
}

export interface LikeDislikeDB {
    user_id: string,
    post_id: string,
    like: number
}