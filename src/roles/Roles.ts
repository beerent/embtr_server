export const enum Role {
    ADMIN = 'admin',
    USER = 'user',
    INVALID = 'invalid',
    NONE = 'NONE',
}

export namespace Roles {
    export const isAdmin = (roles: Role[]): boolean => {
        return roles.includes(Role.ADMIN);
    };
}
