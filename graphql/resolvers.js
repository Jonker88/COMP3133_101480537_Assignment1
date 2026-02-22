const User = require('../models/User');
const Employee = require('../models/Employee');
const { generateToken } = require('../middleware/auth');
const { validateSignupInput, validateEmployeeInput } = require('../utils/validators');
const cloudinary = require('cloudinary').v2;

const resolvers = {
    Query: {
        // 2. Login - Allow user to access the system
        login: async (_, { usernameOrEmail, password }) => {
            try {
                // Find user by username or email
                const user = await User.findOne({
                    $or: [
                        { username: usernameOrEmail },
                        { email: usernameOrEmail.toLowerCase() },
                    ],
                });

                if (!user) {
                    throw new Error('Invalid username/email or password');
                }

                // Compare password
                const isMatch = await user.comparePassword(password);
                if (!isMatch) {
                    throw new Error('Invalid username/email or password');
                }

                // Generate JWT token
                const token = generateToken(user);

                return {
                    token,
                    user: {
                        id: user._id,
                        username: user.username,
                        email: user.email,
                        created_at: user.created_at,
                        updated_at: user.updated_at,
                    },
                };
            } catch (error) {
                throw new Error(error.message);
            }
        },

        // 3. Get all employees
        getAllEmployees: async () => {
            try {
                const employees = await Employee.find();
                return employees.map((emp) => ({
                    id: emp._id,
                    first_name: emp.first_name,
                    last_name: emp.last_name,
                    email: emp.email,
                    gender: emp.gender,
                    designation: emp.designation,
                    salary: emp.salary,
                    date_of_joining: emp.date_of_joining,
                    department: emp.department,
                    employee_photo: emp.employee_photo,
                    created_at: emp.created_at,
                    updated_at: emp.updated_at,
                }));
            } catch (error) {
                throw new Error(`Failed to fetch employees: ${error.message}`);
            }
        },

        // 5. Search employee by eid
        searchEmployeeById: async (_, { eid }) => {
            try {
                const employee = await Employee.findById(eid);
                if (!employee) {
                    throw new Error(`Employee with ID ${eid} not found`);
                }
                return {
                    id: employee._id,
                    first_name: employee.first_name,
                    last_name: employee.last_name,
                    email: employee.email,
                    gender: employee.gender,
                    designation: employee.designation,
                    salary: employee.salary,
                    date_of_joining: employee.date_of_joining,
                    department: employee.department,
                    employee_photo: employee.employee_photo,
                    created_at: employee.created_at,
                    updated_at: employee.updated_at,
                };
            } catch (error) {
                throw new Error(error.message);
            }
        },

        // 8. Search employee by designation or department
        searchEmployeeByDesignationOrDepartment: async (_, { designation, department }) => {
            try {
                if (!designation && !department) {
                    throw new Error('Please provide at least a designation or department to search');
                }

                const filter = {};
                if (designation) {
                    filter.designation = { $regex: designation, $options: 'i' };
                }
                if (department) {
                    filter.department = { $regex: department, $options: 'i' };
                }

                // If both are provided, search with OR logic
                let query;
                if (designation && department) {
                    query = Employee.find({
                        $or: [
                            { designation: { $regex: designation, $options: 'i' } },
                            { department: { $regex: department, $options: 'i' } },
                        ],
                    });
                } else {
                    query = Employee.find(filter);
                }

                const employees = await query;
                return employees.map((emp) => ({
                    id: emp._id,
                    first_name: emp.first_name,
                    last_name: emp.last_name,
                    email: emp.email,
                    gender: emp.gender,
                    designation: emp.designation,
                    salary: emp.salary,
                    date_of_joining: emp.date_of_joining,
                    department: emp.department,
                    employee_photo: emp.employee_photo,
                    created_at: emp.created_at,
                    updated_at: emp.updated_at,
                }));
            } catch (error) {
                throw new Error(error.message);
            }
        },
    },

    Mutation: {
        // 1. Signup - Allow user to create new account
        signup: async (_, { username, email, password }) => {
            try {
                // Validate input
                const errors = validateSignupInput(username, email, password);
                if (errors.length > 0) {
                    throw new Error(errors.join(', '));
                }

                // Check if user already exists
                const existingUser = await User.findOne({
                    $or: [{ username }, { email: email.toLowerCase() }],
                });
                if (existingUser) {
                    throw new Error('Username or email already exists');
                }

                // Create new user
                const user = new User({
                    username,
                    email: email.toLowerCase(),
                    password,
                });

                const savedUser = await user.save();

                return {
                    id: savedUser._id,
                    username: savedUser.username,
                    email: savedUser.email,
                    created_at: savedUser.created_at,
                    updated_at: savedUser.updated_at,
                };
            } catch (error) {
                throw new Error(error.message);
            }
        },

        // 4. Add new employee
        addEmployee: async (_, args) => {
            try {
                // Validate input
                const errors = validateEmployeeInput(args);
                if (errors.length > 0) {
                    throw new Error(errors.join(', '));
                }

                // Check if employee email already exists
                const existingEmployee = await Employee.findOne({ email: args.email.toLowerCase() });
                if (existingEmployee) {
                    throw new Error('An employee with this email already exists');
                }

                // Upload photo to Cloudinary if provided
                let photoUrl = null;
                if (args.employee_photo) {
                    try {
                        const uploadResult = await cloudinary.uploader.upload(args.employee_photo, {
                            folder: 'employee_photos',
                            resource_type: 'image',
                        });
                        photoUrl = uploadResult.secure_url;
                    } catch (uploadError) {
                        console.error('Cloudinary upload error:', uploadError.message);
                        // Store the original value if upload fails
                        photoUrl = args.employee_photo;
                    }
                }

                // Create new employee
                const employee = new Employee({
                    first_name: args.first_name,
                    last_name: args.last_name,
                    email: args.email.toLowerCase(),
                    gender: args.gender,
                    designation: args.designation,
                    salary: args.salary,
                    date_of_joining: new Date(args.date_of_joining),
                    department: args.department,
                    employee_photo: photoUrl,
                });

                const savedEmployee = await employee.save();

                return {
                    id: savedEmployee._id,
                    first_name: savedEmployee.first_name,
                    last_name: savedEmployee.last_name,
                    email: savedEmployee.email,
                    gender: savedEmployee.gender,
                    designation: savedEmployee.designation,
                    salary: savedEmployee.salary,
                    date_of_joining: savedEmployee.date_of_joining,
                    department: savedEmployee.department,
                    employee_photo: savedEmployee.employee_photo,
                    created_at: savedEmployee.created_at,
                    updated_at: savedEmployee.updated_at,
                };
            } catch (error) {
                throw new Error(error.message);
            }
        },

        // 6. Update employee by eid
        updateEmployee: async (_, { eid, ...updateData }) => {
            try {
                // Check if employee exists
                const employee = await Employee.findById(eid);
                if (!employee) {
                    throw new Error(`Employee with ID ${eid} not found`);
                }

                // If email is being updated, check for duplicates
                if (updateData.email) {
                    const existingEmployee = await Employee.findOne({
                        email: updateData.email.toLowerCase(),
                        _id: { $ne: eid },
                    });
                    if (existingEmployee) {
                        throw new Error('An employee with this email already exists');
                    }
                    updateData.email = updateData.email.toLowerCase();
                }

                // Validate gender if provided
                if (updateData.gender && !['Male', 'Female', 'Other'].includes(updateData.gender)) {
                    throw new Error('Gender must be Male, Female, or Other');
                }

                // Validate salary if provided
                if (updateData.salary !== undefined && updateData.salary < 1000) {
                    throw new Error('Salary must be at least 1000');
                }

                // Upload new photo to Cloudinary if provided
                if (updateData.employee_photo) {
                    try {
                        const uploadResult = await cloudinary.uploader.upload(updateData.employee_photo, {
                            folder: 'employee_photos',
                            resource_type: 'image',
                        });
                        updateData.employee_photo = uploadResult.secure_url;
                    } catch (uploadError) {
                        console.error('Cloudinary upload error:', uploadError.message);
                    }
                }

                // Convert date_of_joining if provided
                if (updateData.date_of_joining) {
                    updateData.date_of_joining = new Date(updateData.date_of_joining);
                }

                // Remove undefined fields
                Object.keys(updateData).forEach(
                    (key) => updateData[key] === undefined && delete updateData[key]
                );

                const updatedEmployee = await Employee.findByIdAndUpdate(
                    eid,
                    { $set: updateData },
                    { returnDocument: 'after', runValidators: true }
                );

                return {
                    id: updatedEmployee._id,
                    first_name: updatedEmployee.first_name,
                    last_name: updatedEmployee.last_name,
                    email: updatedEmployee.email,
                    gender: updatedEmployee.gender,
                    designation: updatedEmployee.designation,
                    salary: updatedEmployee.salary,
                    date_of_joining: updatedEmployee.date_of_joining,
                    department: updatedEmployee.department,
                    employee_photo: updatedEmployee.employee_photo,
                    created_at: updatedEmployee.created_at,
                    updated_at: updatedEmployee.updated_at,
                };
            } catch (error) {
                throw new Error(error.message);
            }
        },

        // 7. Delete employee by eid
        deleteEmployee: async (_, { eid }) => {
            try {
                const employee = await Employee.findByIdAndDelete(eid);
                if (!employee) {
                    throw new Error(`Employee with ID ${eid} not found`);
                }

                return {
                    message: 'Employee deleted successfully',
                    id: employee._id,
                };
            } catch (error) {
                throw new Error(error.message);
            }
        },
    },
};

module.exports = resolvers;
