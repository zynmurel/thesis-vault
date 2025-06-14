import bcrypt from "bcrypt";

export const hashPassword = async (plainPassword: string) => {
  const saltRounds = 10;
  const hashed = await bcrypt.hash(plainPassword, saltRounds);
  return hashed;
};