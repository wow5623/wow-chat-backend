import * as bcrypt from 'bcrypt';

export class AuthHelper {
  static async comparePasswords(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }

  static async hashPassword(password: string): Promise<string> {
    const salt = 5;
    return await bcrypt.hash(password, salt);
  }
}
