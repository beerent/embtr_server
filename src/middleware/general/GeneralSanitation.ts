export function sanitizeModel<T>(model: T): T {
    if (!model) {
        return model;
    }

    if (Array.isArray(model)) {
        return model.map((item) => sanitizeModel(item)) as unknown as T;
    }

    if (typeof model === 'object') {
        for (const key in model) {
            if (key === 'email') {
                delete model[key];
            } else if (typeof model[key] === 'object') {
                model[key] = sanitizeModel(model[key]);
            }
        }
    }

    return model;
}
