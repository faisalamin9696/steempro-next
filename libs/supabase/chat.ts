import { supabase } from "./supabase";

export async function getChatLastRead(username: string) {
  if (!username) return "";
  const { data, error } = await supabase.rpc("notifs_last_read", { username });

  if (error) {
    return "";
  }
  return data as string;
}

export async function getUnreadChatCount(username: string): Promise<number> {
  const { data } = await supabase.rpc("get_unread_count", {
    username: username,
  });

  return data ?? 0;
}

export async function getUnreadChatsHeads(
  username: string,
  from: number,
  to: number
): Promise<UnReadChat[]> {
  const { data } = await supabase.rpc("get_chat_heads", {
    username: username,
    from_limit: from,
    to_limit: to,
  });

  return (data ?? []) as UnReadChat[];
}

export async function getUserChat(
  username: string,
  recipient: string,
  from: number = 0,
  to: number
): Promise<Message[]> {
  const { data } = await supabase.rpc("get_user_chat", {
    sender_usr: username,
    recipient_usr: recipient,
    from_limit: from,
    to_limit: to,
  });

  return (data ?? []) as Message[];
}

export async function getCommunityChat(
  account: string,
  from: number = 0,
  to: number
): Promise<Message[]> {
  const { data } = await supabase.rpc("get_community_chat", {
    community_account: account,
    from_limit: from,
    to_limit: to,
  });

  return (data ?? []) as Message[];
}
