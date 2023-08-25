import { UserDatabase } from "../database/UserDatabase"
import { User } from "../models/User"
import { BadRequestError } from '../errors/BadRequestError'
import { LoginInputDTO, LoginOutputDTO, SignupInputDTO, SignupOutputDTO } from "../dtos/UserDTO"
import { NotFoundError } from "../errors/NotFoundError"
import { IdGenerator } from "../services/IdGenerator"
import { TokenManager, TokenPayload } from "../services/TokenManager"
import { ROLES, UserDB } from "../types"
import { HashManager } from "../services/HashManager"

export class UserBusiness {
    constructor(
        private userDBInstance: UserDatabase,
        private idGenerator: IdGenerator,
        private tokenManager: TokenManager,
        private hashManager: HashManager
    ) {}

    public signup = async (input: SignupInputDTO): Promise<SignupOutputDTO> => {

        const { name, email, password } = input

        const id = this.idGenerator.generate()
        const role = ROLES.NORMAL
        const createdAt = new Date().toISOString()
        
        if (name === undefined) throw new BadRequestError("'name' é obrigatório")
        if (typeof name !== "string") throw new BadRequestError("'name' deve ser string")
        
        if (email === undefined) throw new BadRequestError("'email' é obrigatório")
        if (typeof email !== "string") throw new BadRequestError("'email' deve ser string")

        if (password === undefined) throw new BadRequestError("'password' é obrigatório")
        if (typeof password !== "string") throw new BadRequestError("'password' deve ser string")

        if(name.length < 2) {
            throw new BadRequestError("'name' deve ter pelo menos 2 caracteres.")
        }

        if(!email.includes("@")) {
            throw new BadRequestError("'email' inválido!")
        }

        if(password.length < 4) {
            throw new BadRequestError("'password' deve possuir pelo menos 4 caracteres!")
        }

        const hashedPassword = await this.hashManager.hash(password)

        const newUser = new User(
            id,
            name,
            email,
            hashedPassword,
            role,
            createdAt
        )
        
        const newUserDB = newUser.toDBModel()
        await this.userDBInstance.insertUser(newUserDB)

        const tokenPayload: TokenPayload = {
            id: newUser.getId(),
            name: newUser.getName(),
            role: newUser.getRole()
        }

        const token = this.tokenManager.createToken(tokenPayload)

        const output: SignupOutputDTO = {
            token: token
        }

        return output
    }

    public login = async (input: LoginInputDTO): Promise<LoginOutputDTO> => {
        const { email, password } = input

        if (email === undefined) throw new BadRequestError("'email' é obrigatório")

        if (typeof email !== "string") throw new BadRequestError("'email' deve ser string")

        if (password === undefined) throw new BadRequestError("'password' é obrigatório")

        if (typeof password !== "string") throw new BadRequestError("'password' deve ser string")

        if(!email.includes("@")) {
            throw new BadRequestError("'email' inválido!")
        }

        if(password.length < 4) {
            throw new BadRequestError("'password' deve possuir pelo menos 4 caracteres!")
        }

        const userDB: UserDB | undefined = await this.userDBInstance.findUserByEmail(email)

        if (!userDB) { 
            throw new NotFoundError("O 'email' ou 'password' não foi encontrado")
        }

        const user = new User(
            userDB.id,
            userDB.name,
            userDB.email,
            userDB.password,
            userDB.role,
            userDB.created_at,
        )

        const hashedPassword = user.getPassword()

        const isPasswordCorrect = await this.hashManager.compare(password, hashedPassword)

        if(!isPasswordCorrect) {
            throw new BadRequestError("O 'password' está incorreto!")
        }
        
        const tokenPayload: TokenPayload = {
            id: user.getId(),
            name: user.getName(),
            role: user.getRole()
        }

        const token = this.tokenManager.createToken(tokenPayload)

        const output: LoginOutputDTO = {
            token
        }

        return output
    }
 }