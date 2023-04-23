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
                if (typeof value === 'object' && value !== null) {
                    // Check if the object has an "email" property
                    if (value.hasOwnProperty('email')) {
                        //@ts-ignore
                        delete value.email;
                    } else {
                        sanitizeModel(value);
                    }
                }
            }
        }
    }

    return model;
}
