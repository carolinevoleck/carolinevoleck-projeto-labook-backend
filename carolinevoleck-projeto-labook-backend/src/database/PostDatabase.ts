import { Post } from "../models/Post"
import { PostDB, PostCreatorDB, LikeDislikeDB, POST_LIKE } from "../types"
import { BaseDatabase } from "./BaseDatabase"

export class PostDatabase extends BaseDatabase {
  static TABLE_POSTS = "posts"
  static TABLE_LIKES_DISLIKES = "likes_dislikes"

  public async getPostsCreators(): Promise<PostCreatorDB[]> {
    const result: PostCreatorDB[] = await BaseDatabase
      .connection(PostDatabase.TABLE_POSTS)
      .select(
        "posts.id",
        "posts.creator_id",
        "posts.content",
        "posts.likes",
        "posts.dislikes",
        "posts.created_at",
        "posts.updated_at",
        "users.name"
      )
      .join("users", "posts.creator_id", "=", "users.id")

    return result
  }

  public async insertPost(newPostDB: PostDB): Promise<void> {
    await BaseDatabase
      .connection(PostDatabase.TABLE_POSTS)
      .insert(newPostDB)
  }

  public async findPostById(id: string) {
    const [postDB]: PostDB[] | undefined[] = await BaseDatabase
      .connection(PostDatabase.TABLE_POSTS)
      .where({ id })

    return postDB
  }

  public async updatePost(id: string, postDB: PostDB): Promise<void> {
    await BaseDatabase.connection(PostDatabase.TABLE_POSTS)
      .update(postDB)
      .where({ id })

  }

  public async deletePost(id: string): Promise<void> {
    await BaseDatabase.connection(PostDatabase.TABLE_POSTS)
      .delete()
      .where({ id })

  }

  public async finPostCreatorById(postId: string): Promise<PostCreatorDB | undefined> {
    const result: PostCreatorDB[] = await BaseDatabase
      .connection(PostDatabase.TABLE_POSTS)
      .select(
        "posts.id",
        "posts.creator_id",
        "posts.content",
        "posts.likes",
        "posts.dislikes",
        "posts.created_at",
        "posts.updated_at",
        "users.name"
      )
      .join("users", "posts.creator_id", "=", "users.id")
      .where("posts.id", postId)
    return result[0]
  }

  public async likeDislikePost(likeDislike: LikeDislikeDB): Promise<void> {
    await BaseDatabase.connection(PostDatabase.TABLE_LIKES_DISLIKES)
      .insert(likeDislike)
  }

  public async findLikeDislike (likeDislikeDBToFind: LikeDislikeDB): Promise<POST_LIKE | null> {
    const [likeDislikeDB]: LikeDislikeDB[] = await BaseDatabase
      .connection(PostDatabase.TABLE_LIKES_DISLIKES)
      .select()
      .where({
        user_id: likeDislikeDBToFind.user_id,
        post_id: likeDislikeDBToFind.post_id
      })

    if (likeDislikeDB) {
      return likeDislikeDB.like === 1
        ? POST_LIKE.ALREADY_LIKED
        : POST_LIKE.ALREADY_DISLIKED

    } else {
      return null
    }
  }

  public async removeLikeDislike (likeDislikeDB: LikeDislikeDB):Promise<void> {
    await BaseDatabase.connection(PostDatabase.TABLE_LIKES_DISLIKES)
      .delete()
      .where({
        user_id: likeDislikeDB.user_id,
        post_id: likeDislikeDB.post_id
      })
  }

  public async updateLikeDislike (likeDislikeDB: LikeDislikeDB) {
    await BaseDatabase.connection(PostDatabase.TABLE_LIKES_DISLIKES)
      .update(likeDislikeDB)
      .where({
        user_id: likeDislikeDB.user_id,
        post_id: likeDislikeDB.post_id
      })
  }
}