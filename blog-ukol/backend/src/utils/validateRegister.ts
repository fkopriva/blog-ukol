import { NamePasswordInput } from "../resolvers/NamePasswordInput";

export const validateRegister = (options: NamePasswordInput) => {
    if (options.firstname.length <= 2) {
        return [
            {
                field: "firstname",
                message: "First name length must be greater than 2",
            },
        ];
    }

    if (options.lastname.length <= 2) {
        return [
            {
                field: "lastname",
                message: "Last name length must be greater than 2",
            },
        ];
    }

    if (!options.email.includes("@")) {
        return [
            {
                field: "email",
                message: "Invalid email",
            },
        ];
    }

    if (options.password.length <= 2) {
        return [
            {
                field: "password",
                message: "Password length must be greater than 2",
            },
        ];
    }

    if (options.confirmPassword !== options.password) {
        return [
            {
                field: "confirmPassword",
                message: "Confirm password is not same as password",
            }
        ]
    }

    return null;
}