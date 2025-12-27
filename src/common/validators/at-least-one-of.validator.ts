import {
    ValidationArguments,
    ValidatorConstraint,
    ValidatorConstraintInterface,
} from "class-validator";

@ValidatorConstraint({ name: "atLeastOneOf", async: false })
export class AtLeastOneOfConstraint implements ValidatorConstraintInterface {
    validate(_value: unknown, args: ValidationArguments): boolean {
        const properties = args.constraints as string[];
        const object = args.object as Record<string, unknown>;

        return properties.some((property) => {
            const value = object[property];
            return value !== undefined && value !== null && value !== "";
        });
    }

    defaultMessage(args: ValidationArguments): string {
        const properties = args.constraints as string[];
        return `At least one of the following properties must be provided: ${properties.join(", ")}`;
    }
}
