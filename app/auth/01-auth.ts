"use server";
import {
  FormState,
  LoginFormSchema,
  // SignupFormSchema,
} from "@/app/auth/definitions";
import { createSession, deleteSession } from "@/app/auth/02-stateless-session";

// export async function signup(
//   state: FormState,
//   formData: FormData
// ): Promise<FormState> {
//   // 1. Validate form fields
//   const validatedFields = SignupFormSchema.safeParse({
//     name: formData.get("name"),
//     email: formData.get("email"),
//     password: formData.get("password"),
//   });

//   // If any form fields are invalid, return early
//   if (!validatedFields.success) {
//     return {
//       errors: validatedFields.error.flatten().fieldErrors,
//     };
//   }

//   // 2. Prepare data for insertion into database
//   const { name, email, password } = validatedFields.data;

//   // 3. Check if the user's email already exists
//   const existingUser = await db.query.users.findFirst({
//     where: eq(users.email, email),
//   });

//   if (existingUser) {
//     return {
//       message: "Email already exists, please use a different email or login.",
//     };
//   }

//   // Hash the user's password
//   const hashedPassword = await bcrypt.hash(password, 10);

//   // 3. Insert the user into the database or call an Auth Provider's API
//   const data = await db
//     .insert(users)
//     .values({
//       name,
//       email,
//       password: hashedPassword,
//     })
//     .returning({ id: users.id });

//   const user = data[0];

//   if (!user) {
//     return {
//       message: "An error occurred while creating your account.",
//     };
//   }

//   // 4. Create a session for the user
//   const userId = user.id.toString();
//   await createSession(userId);
// }

export async function login(
  state: FormState,
  formData: FormData
): Promise<FormState> {
  // 1. Validate form fields
  const validatedFields = LoginFormSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  // If any form fields are invalid, return early
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  // 2. Make the login API call with the given verified email and password
  const req = await fetch(`${process.env.BACKEND_URL}/v1/auth/login`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      email: validatedFields.data.email,
      password: validatedFields.data.password,
    }),
  });

  const res = await req.json();

  if (req.status !== 200) {
    return res;
  }

  // 3. If login successful, create a session for the user and redirect
  await createSession(res);
}

export async function logout() {
  deleteSession();
}
