import { supabase } from "./supabase";

export async function addSchedule(props: Schedule) {
  const {
    username,
    title,
    body,
    tags,
    parent_permlink,
    options,
    time,
    status,
    permlink,
    message,
  } = props;
  if (!title || !body)
    return { success: false, error: "Title and body are required" };
  const session = await supabase.auth.getUser();

  try {
    // Insert the schedule record
    const { error: insertError, count } = await supabase
      .from("steempro_schedules")
      .insert(
        [
          {
            username,
            title,
            body,
            tags,
            parent_permlink,
            options,
            time,
            status,
            permlink,
            message,
            uid: session.data.user?.id,
          },
        ],
        { count: "exact" }
      );

    if (count === 0) {
      throw new Error("Insert schedule failed");
    }

    if (insertError) {
      console.error("Insert schedule failed:", insertError);
      throw new Error(insertError.message);
    }
    return { success: true };
  } catch (e: any) {
    console.error("Unexpected error in addSchedule:", e);
    throw new Error(e.message);
  }
}

export async function getSchedules(username: string) {
  try {
    const { data, error } = await supabase.rpc("get_schedules", {
      p_username: username,
    });
    if (error) {
      console.error("Get schedules failed:", error);
      throw new Error(error.message);
    }
    return data as Schedule[];
  } catch (e: any) {
    console.error("Unexpected error in getSchedules:", e);
    throw new Error(e.message);
  }
}

export async function deleteSchedule(id: number) {
  try {
    const { error, count } = await supabase
      .from("steempro_schedules")
      .delete({ count: "estimated" })
      .eq("id", id);

    // Check if any rows were actually deleted
    if (count === 0) {
      throw new Error("Schedule not found or already deleted");
    }

    if (error) {
      console.error("Delete schedule failed:", error);
      throw new Error(error.message); // ← Return error here
    }
    return { success: true };
  } catch (e: any) {
    console.error("Unexpected error in deleteSchedule:", e);
    throw new Error(e.message); // ← Return error here
  }
}
export async function updateSchedule(id: number, props: Partial<Schedule>) {
  try {
    const { error, count } = await supabase
      .from("steempro_schedules")
      .update(props, { count: "estimated" })
      .eq("id", id);

    if (count === 0) {
      throw new Error("Update schedule failed");
    }

    if (error) {
      console.error("Update schedule failed:", error);
      throw new Error(error.message);
    }
    return { success: true };
  } catch (e: any) {
    console.error("Unexpected error in updateSchedule:", e);
    throw new Error(e.message);
  }
}
