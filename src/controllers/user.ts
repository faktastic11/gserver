import bcrypt from 'bcrypt'
import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { User, UserHistory } from 'models'
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY
const JWT_TOKEN_EXPIRATION = process.env.JWT_TOKEN_EXPIRATION

export const signUpUser = async (req: Request, res: Response, _next: NextFunction) => {
  const { name, email, password } = req.body
  try {
    const userExists = await User.findOne({
      email: req.body.email,
    }).exec()

    if (userExists) {
      return res.status(400).send({ error: 'User with this email already exists' })
    }

    const user = await User.create({
      name,
      email,
      password,
    })

    if (!user) {
      return res.status(500).send({ error: 'Could not create user' })
    }

    return res.send({
      message: 'User signed up successfully.',
      user,
    })
  } catch (error) {
    console.error('SignUp error:', error)
    return res.status(500).send({ error: 'Internal server error' })
  }
}

export const loginUser = async (req: Request, res: Response, _next: NextFunction) => {
  const { email, password } = req.body
  try {
    const user = await User.findOne({ email }).select('+password').exec()
    if (!user) {
      return res.status(404).send({ error: 'User not found' })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return res.status(401).send({ error: 'Invalid email or password' })
    }

    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET_KEY, { expiresIn: JWT_TOKEN_EXPIRATION })
    user.password = undefined
    return res.send({
      message: 'User logged in successfully',
      token,
      user,
    })
  } catch (err) {
    console.error('Login error:', err)
    return res.status(500).send({ error: 'Internal server error' })
  }
}

export const getMyProfile = async (req: Request | any, res: Response, _next: NextFunction) => {
  const { userId } = req.user
  try {
    if (!userId) {
      return res.status(400).send({ error: 'User not found' })
    }
    const user = await User.findById(userId).exec()
    return res.status(200).send({
      message: 'User profile fetched successfully',
      user,
    })
  } catch (err) {
    console.error('Login error:', err)
    return res.status(500).send({ error: 'Internal server error' })
  }
}

export const logOut = async (req: Request, res: Response, _next: NextFunction) => {
  try {
    return res.clearCookie('token').send({ message: 'Logged out successfully' })
  } catch (error) {
    console.error('Logout error:', error)
    return res.status(500).send({ error: 'Internal server error' })
  }
}

export const userRecentSearches = async (req: Request | any, res: Response, _next: NextFunction) => {
  try {
    const { userId } = req.user
    const userExists = await User.findById(userId).exec()
    if (!userExists) {
      return res.status(400).send({ error: 'User not found' })
    }

    const userHistory = await UserHistory.findOne({ userId }).exec()
    const { searches } = userHistory
    const lastThreeSearches = searches.slice(-3)
    return res.status(200).send({
      message: 'User recent searches fetched successfully',
      searches: lastThreeSearches || [],
    })

    return res.send({ message: 'Protected resource fetched successfully' })
  } catch (error) {
    console.error('Protected resource error:', error)
    return res.status(500).send({ error: 'Internal server error' })
  }
}
