import { useEffect } from "react";
import { supabase } from "../supabase";

type UseRealtimeMessagesProps = {
  sender: string;
  recipient: string;
  onNewMessage: (message: Message) => void;
};

const useRealtimeMessages = ({
  sender,
  recipient,
  onNewMessage,
}: UseRealtimeMessagesProps) => {
  useEffect(() => {
    const channel = supabase
      .channel(`chat-${sender}-${recipient}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "steempro_chat",
          filter: `sender=eq.${sender}`,
        },
        async (payload) => {
          const msg = payload.new as Message;
          if (msg.recipient === recipient) {
            if (msg.ref_tid) {
              const { data, error } = await supabase
                .from("steempro_chat")
                .select("*")
                .eq("tid", msg.ref_tid)
                .single();
              if (data) {
                onNewMessage({ ...msg, ref_message: data });
              }
            } else onNewMessage(msg);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "steempro_chat",
          filter: `sender=eq.${recipient}`,
        },
        async (payload) => {
          const msg = payload.new as Message;
          if (msg.recipient === sender) {
            if (msg.ref_tid) {
              const { data, error } = await supabase
                .from("steempro_chat")
                .select("*")
                .eq("tid", msg.ref_tid)
                .single();
              if (data) {
                onNewMessage({ ...msg, ref_message: data });
              }
            } else onNewMessage(msg);
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [supabase, sender, recipient, onNewMessage]);
};

export default useRealtimeMessages;
