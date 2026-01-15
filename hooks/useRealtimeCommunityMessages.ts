import { useEffect } from "react";
import { supabase } from "../libs/supabase/supabase";

type UseRealtimeMessagesProps = {
  community_account: string;
  onNewMessage: (message: Message) => void;
};

const useRealtimeCommunityMsgs = ({
  onNewMessage,
  community_account,
}: UseRealtimeMessagesProps) => {
  useEffect(() => {
    const channel = supabase
      .channel(`chat-community-${community_account}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "steempro_chat",
          filter: `community=eq.${community_account}`,
        },
        async (payload) => {
          const msg = payload.new as Message;
          if (msg.recipient === community_account) {
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
  }, [supabase, community_account, onNewMessage]);
};

export default useRealtimeCommunityMsgs;
