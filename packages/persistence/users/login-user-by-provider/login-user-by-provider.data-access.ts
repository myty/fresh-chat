import type {
  LoginUserByProviderCommand,
  LoginUserByProviderDataAccess,
  LoginUserByProviderResponse,
} from "@myty/fresh-workspace-domain/users/login-user-by-provider";
import type { GetAuthProviderUserResponse } from "@myty/fresh-workspace-domain/auth-providers/get-auth-provider-user";
import type { User } from "../../entities/user.entity.ts";

export class LoginUserByProviderDataAccessKv
  implements LoginUserByProviderDataAccess {
  constructor(private kv: Deno.Kv) {}

  async loginUser(
    command: LoginUserByProviderCommand,
    authProviderResponse: GetAuthProviderUserResponse,
  ): Promise<LoginUserByProviderResponse> {
    const user = await this.kv.get<User>(["users", authProviderResponse.login]);

    if (user.value === null) {
      return await this.createUser({
        handle: authProviderResponse.login,
        sessionId: command.sessionId,
        name: authProviderResponse.name,
        avatarUrl: authProviderResponse.avatarUrl,
      });
    }

    return await this.updateUserSession(
      {
        ...user.value,
        name: authProviderResponse.name,
        avatarUrl: authProviderResponse.avatarUrl,
      },
      command.sessionId,
    );
  }

  private async createUser(user: User): Promise<User> {
    const usersKey = ["users", user.handle];
    const usersBySessionKey = ["users_by_session", user.sessionId];

    const res = await this.kv.atomic()
      .check({ key: usersKey, versionstamp: null })
      .check({ key: usersBySessionKey, versionstamp: null })
      .set(usersKey, user)
      .set(usersBySessionKey, user)
      .commit();

    if (!res.ok) throw new Error("Failed to create user");

    return user;
  }

  private async updateUserSession(
    user: User,
    sessionId: string,
  ): Promise<User> {
    const userKey = ["users", user.handle];
    const oldUserBySessionKey = ["users_by_session", user.sessionId];
    const newUserBySessionKey = ["users_by_session", sessionId];
    const newUser: User = { ...user, sessionId };

    const res = await this.kv.atomic()
      .set(userKey, newUser)
      .delete(oldUserBySessionKey)
      .check({ key: newUserBySessionKey, versionstamp: null })
      .set(newUserBySessionKey, newUser)
      .commit();

    if (!res.ok) throw new Error("Failed to update user session");

    return newUser;
  }
}
