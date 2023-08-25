import { PostDatabase } from "../database/PostDatabase";
import { Post } from "../models/Post"
import { BadRequestError } from '../errors/BadRequestError'
import { CreatePostInputDTO, DeletePostInputDTO, EditPostInputDTO, GetPostsInputDTO, GetPostsOutputDTO } from "../dtos/PostDTO";
import { IdGenerator } from "../services/IdGenerator";
import { TokenManager } from "../services/TokenManager";
import { LikeDislikeDB, PostCreatorDB, POST_LIKE, ROLES } from "../types";
import { LikeDisliketInputDTO } from "../dtos/LikeDislikeDTO";

export class PostBusiness {
    constructor(
        private postDatabase: PostDatabase,
        private idGenerator: IdGenerator,
        private tokenManager: TokenManager
    ) { }

    public getPosts = async (input: GetPostsInputDTO): Promise<GetPostsOutputDTO> => {
        const { token } = input

        if (token === undefined) {
            throw new BadRequestError("Insira o 'token'")
        }

        const payload = this.tokenManager.getPayload(token)

        if (payload === null) {
            throw new BadRequestError("O 'token' não é válido!")
        }

        const postsCreatorsDB: PostCreatorDB[] = await this.postDatabase.getPostsCreators()

        const posts = postsCreatorsDB.map((postCreatorDB) => {
            const post = new Post(
                postCreatorDB.id,
                postCreatorDB.content,
                postCreatorDB.likes,
                postCreatorDB.dislikes,
                postCreatorDB.created_at,
                postCreatorDB.updated_at,
                postCreatorDB.creator_id,
                postCreatorDB.name
            )

            return post.toBusinessModel()
        })

        const output: GetPostsOutputDTO = posts

        return output
    }

    public createPost = async (input: CreatePostInputDTO): Promise<void> => {

        const { token, content } = input

        if (token === undefined) {
            throw new BadRequestError("Insira o 'token'")
        }

        const payload = this.tokenManager.getPayload(token)

        if (payload === null) {
            throw new BadRequestError("O 'token' não é válido!")
        }

        if (typeof content !== "string") {
            throw new BadRequestError("O 'content' deve ser string!")
        }

        const id = this.idGenerator.generate()
        const createdAt = new Date().toISOString()
        const updatedAt = new Date().toISOString()
        const creatorId = payload.id
        const name = payload.name

        const post = new Post(
            id,
            content,
            0,
            0,
            createdAt,
            updatedAt,
            creatorId,
            name
        )

        const postDB = post.toDBModel()
        await this.postDatabase.insertPost(postDB)
    }

    public editPost = async (input: EditPostInputDTO): Promise<void> => {
        const { idEdit, content, token } = input

        if (token === undefined) {
            throw new BadRequestError("Insira o 'token'")
        }

        const payload = this.tokenManager.getPayload(token)

        if (payload === null) {
            throw new BadRequestError("O 'token' não é válido!")
        }

        if (typeof content !== "string") {
            throw new BadRequestError("O 'content' deve ser string!")
        }

        const postExist = await this.postDatabase.findPostById(idEdit)

        if (!postExist) {
            throw new BadRequestError("O 'id' não foi encontrado!")
        }

        const creatorId = payload.id

        if (postExist.creator_id !== creatorId) {
            throw new BadRequestError("Apenas quem criou o Post pode editar!")
        }

        const name = payload.name

        const post = new Post(
            postExist.id,
            postExist.content,
            postExist.likes,
            postExist.dislikes,
            postExist.created_at,
            postExist.updated_at,
            creatorId,
            name
        )

        post.setContent(content)
        post.setUpdatedAt(new Date().toISOString())

        const updatedPostDB = post.toDBModel()

        await this.postDatabase.updatePost(idEdit, updatedPostDB)

    }


    public deletePost = async (input: DeletePostInputDTO): Promise<void> => {

        const { idDelete, token } = input

        if (token === undefined) {
            throw new BadRequestError("Insira o 'token'")
        }

        const payload = this.tokenManager.getPayload(token)

        if (payload === null) {
            throw new BadRequestError("O 'token' não é válido!")
        }

        const postExist = await this.postDatabase.findPostById(idDelete)

        if (!postExist) {
            throw new BadRequestError("O 'id' não foi encontrado!")
        }

        const creatorId = payload.id

        if (payload.role !== ROLES.ADMIN && postExist.creator_id !== creatorId) {
            throw new BadRequestError("Apenas quem criou ou um Admin pode deletar o post!")
        }

        await this.postDatabase.deletePost(idDelete)

    }

    public likeDislikePost = async (input: LikeDisliketInputDTO) => {
        const { idLikeDislike, token, like } = input

        if (token === undefined) {
            throw new BadRequestError("Insira o 'token'")
        }

        const payload = this.tokenManager.getPayload(token)

        if (payload === null) {
            throw new BadRequestError("O 'token' não é válido!")
        }

        if (typeof like !== "boolean") {
            throw new BadRequestError("O 'like' precisa ser um booleano!")
        }

        const postCreatorDB = await this.postDatabase.finPostCreatorById(idLikeDislike)

        if (!postCreatorDB) {
            throw new BadRequestError("O 'id' não foi encontrado!")
        }

        const userId = payload.id
        const likeDB = like ? 1 : 0

        const likeDislike: LikeDislikeDB = {
            user_id: userId,
            post_id: postCreatorDB.id,
            like: likeDB
        }

        const post = new Post(
            postCreatorDB.id,
            postCreatorDB.content,
            postCreatorDB.likes,
            postCreatorDB.dislikes,
            postCreatorDB.created_at,
            postCreatorDB.updated_at,
            postCreatorDB.creator_id,
            postCreatorDB.name
        )

        const likeDislikeExists = await this.postDatabase.findLikeDislike(likeDislike)

        if (likeDislikeExists === POST_LIKE.ALREADY_LIKED) {
            if (like) {
                await this.postDatabase.removeLikeDislike(likeDislike)
                post.removeLike()
            } else {
                await this.postDatabase.updateLikeDislike(likeDislike)
                post.removeLike()
                post.addDislike()
            }
        } else if (likeDislikeExists === POST_LIKE.ALREADY_DISLIKED) {
            if (like) {
                await this.postDatabase.updateLikeDislike(likeDislike)
                post.removeDislike()
                post.addLike()
            } else {
                await this.postDatabase.removeLikeDislike(likeDislike)
                post.removeDislike()
            }
        } else {
            await this.postDatabase.likeDislikePost(likeDislike)
            like ? post.addLike() : post.addDislike()
        }

        const updatedPostDB = post.toDBModel()

        await this.postDatabase.updatePost(idLikeDislike, updatedPostDB)
    }
}