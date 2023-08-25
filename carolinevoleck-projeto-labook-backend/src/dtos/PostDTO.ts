import { PostModel } from "../types"

export interface GetPostsInputDTO {
    token: string | undefined
}

export type GetPostsOutputDTO = PostModel[]

export interface CreatePostInputDTO {
    token: string | undefined,
    content: unknown
}

export interface EditPostInputDTO {
    idEdit: string,
    token: string | undefined,
    content: unknown
}

export interface DeletePostInputDTO {
    idDelete: string,
    token: string | undefined
}

