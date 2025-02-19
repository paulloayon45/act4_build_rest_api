import express, { Request, Response } from "express";
import { UnitUser, User } from "./user.interface"
import { StatusCodes } from "http-status-codes"
import * as database from "./user.database"

export const userRouter = express.Router()

userRouter.get("/users", async (req: Request, res: Response) => {
    try {
        const allUsers: UnitUser[] = await database.findAll()
        if (!allUsers) {
            res.status(StatusCodes.NOT_FOUND).json({ msg: `No users at this time ...` })
        }

        res.status(StatusCodes.OK).json({ total_user: allUsers.length, allUsers })
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error })
    }
})

userRouter.get("/user/:id", async (req: Request, res: Response) => {
    try {
        const user: UnitUser = await database.findOne(req.params.id)

        if (!user) {
            res.status(StatusCodes.NOT_FOUND).json({ error: `User not found!` })
        }
        res.status(StatusCodes.OK).json({ user })
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error })
    }
})


userRouter.post("/register", async (req: Request, res: Response) => {
    try {
        const { username, email, password } = req.body
        if (!username || !email || !password) {
            res.status(StatusCodes.BAD_REQUEST).json({ error: `Please provide all the required parameters..` })
        }
        const user = await database.findByEmail(email)

        if (user) {
            res.status(StatusCodes.BAD_REQUEST).json({ error: `This email has already been registered..` })
        }

        const newUser = await database.create(req.body)

        res.status(StatusCodes.CREATED).json({ newUser })
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error })
    }

})

userRouter.post("/login", async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body
        if (!email || !password) {
            res.status(StatusCodes.BAD_REQUEST).json({ error: `Please Provide all the required parameters...` })
        }

        const user = await database.findByEmail(email)
        if (!user) {
            res.status(StatusCodes.NOT_FOUND).json({ error: `No users exist with the email provided..` })
        }

        const comparePassword = await database.comparePassword(email, password)

        if (!comparePassword) {
            res.status(StatusCodes.BAD_REQUEST).json({ error: `Incorrect Password!` })
        }
        res.status(StatusCodes.OK).json({ user })
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error })
    }
})

userRouter.put('/user/:id', async (req: Request, res: Response) => {
    try {
        const { username, email, password } = req.body
        const getUser = await database.findOne(req.params.id)

        if (!username || !email || !password) {
            res.status(401).json({ error: `Please provide all the required parameter..` })
        }
        if (!getUser) {
            res.status(404).json({ error: `No user with id ${req.params.id}` })
        }
        const updateUser = await database.update((req.params.id), req.body)
        res.status(201).json({ updateUser })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error })
    }

})

userRouter.delete('/user/:id', async (req: Request, res: Response) => {
    try {
        const id = (req.params.id);
        const user = await database.findOne(id)

        if (!user) {
            res.status(StatusCodes.NOT_FOUND).json({ error: `User does not exist` })
        }
        await database.remove(id)
        res.status(StatusCodes.OK).json({ msg: "User deleted" })
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error })
    }
})