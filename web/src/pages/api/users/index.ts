import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/database';
import UserModel from '@/lib/models/User';

const BCRYPT_ROUNDS = 10;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== `POST`) {
    return res.status(405).json({ error: `Method Not Allowed` });
  }
  if (process.env.NEXT_PUBLIC_ALLOW_REGISTRATION !== `true`) {
    return res.status(403).json({ error: `Registration is disabled` });
  }
  try {
    const { email, pseudo, password } = req.body ?? {};
    if (
      typeof email !== `string` ||
      typeof pseudo !== `string` ||
      typeof password !== `string` ||
      !email ||
      !pseudo ||
      password.length < 8
    ) {
      return res.status(400).json({
        error: `email, pseudo and a password of at least 8 characters are required`,
      });
    }

    await dbConnect();
    if (await UserModel.exists({ email })) {
      return res.status(409).json({ error: `Email already registered` });
    }

    const user = await UserModel.create({
      email,
      pseudo,
      password: await bcrypt.hash(password, BCRYPT_ROUNDS),
    });
    return res
      .status(201)
      .json({ _id: user._id, email: user.email, pseudo: user.pseudo });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: `Internal Server Error` });
  }
}
