const validateSignupInput = (username, email, password) => {
    const errors = [];

    if (!username || username.trim().length === 0) {
        errors.push('Username is required');
    } else if (username.trim().length < 3) {
        errors.push('Username must be at least 3 characters');
    }

    if (!email || email.trim().length === 0) {
        errors.push('Email is required');
    } else {
        const emailRegex = /^\S+@\S+\.\S+$/;
        if (!emailRegex.test(email)) {
            errors.push('Please enter a valid email address');
        }
    }

    if (!password || password.length === 0) {
        errors.push('Password is required');
    } else if (password.length < 6) {
        errors.push('Password must be at least 6 characters');
    }

    return errors;
};

const validateEmployeeInput = (input) => {
    const errors = [];

    if (!input.first_name || input.first_name.trim().length === 0) {
        errors.push('First name is required');
    }

    if (!input.last_name || input.last_name.trim().length === 0) {
        errors.push('Last name is required');
    }

    if (!input.email || input.email.trim().length === 0) {
        errors.push('Email is required');
    } else {
        const emailRegex = /^\S+@\S+\.\S+$/;
        if (!emailRegex.test(input.email)) {
            errors.push('Please enter a valid email address');
        }
    }

    if (!input.gender) {
        errors.push('Gender is required');
    } else if (!['Male', 'Female', 'Other'].includes(input.gender)) {
        errors.push('Gender must be Male, Female, or Other');
    }

    if (!input.designation || input.designation.trim().length === 0) {
        errors.push('Designation is required');
    }

    if (input.salary === undefined || input.salary === null) {
        errors.push('Salary is required');
    } else if (input.salary < 1000) {
        errors.push('Salary must be at least 1000');
    }

    if (!input.date_of_joining) {
        errors.push('Date of joining is required');
    }

    if (!input.department || input.department.trim().length === 0) {
        errors.push('Department is required');
    }

    return errors;
};

module.exports = { validateSignupInput, validateEmployeeInput };
