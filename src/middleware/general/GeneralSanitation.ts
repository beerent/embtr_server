import { User } from '@resources/schema';

export function sanitizeModel<T>(model: T): T {
    if (!model) {
        return model;
    }

    if (Array.isArray(model)) {
        return model.map((item) => sanitizeModel(item)) as unknown as T;
    }

    if (typeof model === 'object') {
        for (const key in model) {
            if (model.hasOwnProperty(key)) {
                const value = model[key];
                if (key === 'user' && value) {
                    // Remove the email field from the User object
                    const user = value as User;
                    delete user.email;
                } else {
                    model[key] = sanitizeModel(value);
                }
            }
        }
    }

    return model;
}
