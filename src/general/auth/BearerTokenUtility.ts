export const getBearerToken = (token: string): string => {
    if (token.includes('Bearer')) {
        return token;
    }

    return `Bearer ${token}`;
};
