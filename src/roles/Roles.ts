export const enum Role {
    ADMIN = 'admin',
    USER = 'user',
    INVALID = 'invalid',
}

export const enum Permission {
    USER_READ = 'user:read',
}

export interface RolePermissions {
    role: Role;
    permissions: Permission[];
}

export const ADMIN_ROLE: RolePermissions = {
    role: Role.ADMIN,
    permissions: [Permission.USER_READ],
};

export const USER_ROLE: RolePermissions = {
    role: Role.USER,
    permissions: [Permission.USER_READ],
};

export const INVALID_ROLE: RolePermissions = {
    role: Role.INVALID,
    permissions: [],
};
