import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const { title, description } = await request.json();

    // Extract the token from the Authorization header
    const authHeader = request.headers.get("Authorization");
    const token = authHeader?.split("Bearer ")[1];

    if (!token) {
      return NextResponse.json(
        { error: "Missing or invalid token" },
        { status: 401 }
      );
    }

    // Create a new Supabase client for this request
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    );

    // Get the user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    // Insert the task
    const { error: insertError } = await supabase.from("tasks").insert([
      {
        title,
        description,
        user_id: user.id,
      },
    ]);

    if (insertError) {
      console.error("Error inserting task:", insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Task added successfully!" });
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// import { NextResponse } from "next/server";
// import { supabase } from "../../../lib/supabaseClient";

// export async function POST(request: Request) {
//   try {
//     const { title, description } = await request.json();

//     const authHeader = request.headers.get("Authorization");
//     const token = authHeader?.split("Bearer ")[1];

//     if (!token) {
//       return NextResponse.json(
//         { error: "Missing or invalid token" },
//         { status: 401 }
//       );
//     }

//     // Validate the token with Supabase
//     const {
//       data: { user },
//       error: userError,
//     } = await supabase.auth.getUser(token);

//     if (userError || !user) {
//       return NextResponse.json(
//         { error: "Invalid or expired token" },
//         { status: 401 }
//       );
//     }

//     // Insert the task into the database
//     const { error: insertError } = await supabase.from("tasks").insert([
//       {
//         title,
//         description,
//         user_id: user.id, // Include user_id to match RLS policy
//       },
//     ]);

//     if (insertError) {
//       return NextResponse.json({ error: insertError.message }, { status: 500 });
//     }

//     return NextResponse.json({ message: "Task added successfully!" });
//   } catch (error) {
//     console.error("Error occurred in API route:", error);
//     return NextResponse.json(
//       { error: "Internal Server Error" },
//       { status: 500 }
//     );
//   }
// }
