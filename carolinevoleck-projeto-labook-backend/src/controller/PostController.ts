import { Request, Response } from "express"
import { PostBusiness } from "../business/PostBusiness"
import { BaseError } from "../errors/BaseError"
import { CreatePostInputDTO, DeletePostInputDTO, GetPostsInputDTO } from "../dtos/PostDTO"
import { LikeDisliketInputDTO } from "../dtos/LikeDislikeDTO"

export class PostController {
  constructor(
    private postBusiness: PostBusiness
  ) { }

  getPosts = async (req: Request, res: Response) => {
    try {
      const input: GetPostsInputDTO = {
        token: req.headers.authorization
      }

      const output = await this.postBusiness.getPosts(input)

      res.status(200).send(output)
    } catch (error) {
      console.log(error)

      if (error instanceof BaseError) {
        res.status(error.statusCode).send(error.message)
      } else {
        res.status(500).send("Erro inesperado")
      }
    }
  }

  createPost = async (req: Request, res: Response) => {
    try {

      const input: CreatePostInputDTO = {
        token: req.headers.authorization,
        content: req.body.content
      }

      await this.postBusiness.createPost(input)

      res.status(201).end()

    } catch (error) {
      console.log(error)

      if (error instanceof BaseError) {
        res.status(error.statusCode).send(error.message)
      } else {
        res.status(500).send("Erro inesperado")
      }
    }
  }

  editPost = async (req: Request, res: Response) => {
    try {
      const input = {
        idEdit: req.params.id,
        content: req.body.content,
        token: req.headers.authorization
      }

      await this.postBusiness.editPost(input)

      res.status(200).end()

    } catch (error) {
      console.log(error)

      if (error instanceof BaseError) {
        res.status(error.statusCode).send(error.message)
      } else {
        res.status(500).send("Erro inesperado")
      }
    }
  }

  public deletePost = async (req: Request, res: Response) => {
    try {
      const input: DeletePostInputDTO = {
        idDelete: req.params.id,
        token: req.headers.authorization
      }

      await this.postBusiness.deletePost(input)

      res.status(200).end()

    } catch (error) {
      console.log(error)

      if (error instanceof BaseError) {
        res.status(error.statusCode).send(error.message)
      } else {
        res.status(500).send("Erro inesperado")
      }
    }
  }

  public likeDislikePost = async (req: Request, res: Response) => {
    try {
      const input: LikeDisliketInputDTO = {
        idLikeDislike: req.params.id,
        token: req.headers.authorization,
        like: req.body.like
      }

      await this.postBusiness.likeDislikePost(input)

      res.status(200).end()

    } catch (error) {
      console.log(error)

      if (error instanceof BaseError) {
        res.status(error.statusCode).send(error.message)
      } else {
        res.status(500).send("Erro inesperado")
      }
    }
  }
}
