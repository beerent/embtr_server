export const enum Role {
    ADMIN = 'admin',
    USER = 'user',
    FREE = 'free',
    PREMIUM = 'premium',
    INVALID = 'invalid',
    NONE = 'NONE',
}

export namespace Roles {
    export const isAdmin = (roles: Role[]): boolean => {
        return roles.includes(Role.ADMIN);
    };

    export const isPremium = (roles: Role[]): boolean => {
        return roles.includes(Role.PREMIUM);
    };

    export const getRoles = (roles: string[]): Role[] => {
        return roles.map((role) => {
            switch (role) {
                case Role.ADMIN:
                    return Role.ADMIN;
                case Role.USER:
                    return Role.USER;
                case Role.FREE:
                    return Role.FREE;
                case Role.PREMIUM:
                    return Role.PREMIUM;
                default:
                    return Role.INVALID;
            }
        });
    };
}
