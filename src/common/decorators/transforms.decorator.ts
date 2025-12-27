import { Transform } from "class-transformer";

export function ToBoolean() {
    return Transform(({ value, obj, key }) => {
        // Get the original raw value from the object if it exists
        // This bypasses the implicit conversion that already happened
        const rawValue = obj?.[key] ?? value;

        if (rawValue === "true" || rawValue === true || rawValue === "1" || rawValue === 1) {
            return true;
        }
        if (rawValue === "false" || rawValue === false || rawValue === "0" || rawValue === 0) {
            return false;
        }
        return undefined;
    });
}
