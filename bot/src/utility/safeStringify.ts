export function safeStringify(obj: unknown) {
    try {
        const seen = new WeakSet();
        return JSON.stringify(obj, function(_key, value) {
            if (typeof value === "object" && value !== null) {
                if (seen.has(value)) return "[Circular]";
                seen.add(value as object);
            }
            return value;
        });
    } catch {
        try {
            return String(obj);
        } catch {
            return "[unserializable]";
        }
    }
}