import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../prismaClient.js";
import cloudinary from "../config/cloudinary.js";
// Nhận request và trả về response

export const register = async (req, res) => {
  try {
    const { username, password, displayName } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 8);

    // Upload avatar
    const fileBuffer = req.file?.buffer;
    let avatarUrl = null;
    if (fileBuffer) {
      const uploadStream = () =>
        new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { resource_type: "image", folder: "avatars" },
            (error, result) => {
              if (error) return reject(error);
              return resolve(result);
            }
          );
          stream.end(fileBuffer);
        });
      const result = await uploadStream();
      avatarUrl = result.secure_url;
    }

    // Create new user
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        displayName: displayName ?? null,
        avatar: avatarUrl,
      },
    });

    // Create a token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    return res.status(200).json(token);
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await prisma.user.findUnique({
      where: {
        username: username, // Username in database = username in the body of request
      },
    });

    // None user associated with that username
    if (!user) {
      console.log("No has username");
    }

    const passwordIsValid = bcrypt.compareSync(password, user.password);

    // Password does not match
    if (!passwordIsValid) {
      console.log("Incorrect password");
    }
    console.log(user);

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    return res.status(200).json(token);
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};
