import { supabase } from "../supabase";
import axios from "axios";


type Props = {
  author?: string;
  permlink?: string;
  authPerm?: string;
  comment?: Post | Feed;
} & (
  | { author: string; permlink: string }
  | { authPerm: string }
  | { comment: Post | Feed }
);

export async function updatePostView(props: Props) {
  let authPerm;
  if (!props.authPerm)
    authPerm = `${props.author || props.comment?.author}/${
      props.permlink || props.comment?.permlink
    }`;
  else authPerm = props.authPerm;

  const session = await supabase.auth.getSession();

  try {
    if (!session.data.session?.access_token) {
      const { data: supaData } = await supabase.auth.signInAnonymously();
      axios.post(
        "/api/steem/add",
        {
          jwt: supaData.session?.access_token,
          authPerm,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    } else {
      axios.post(
        "/api/steem/add",
        {
          jwt: session.data.session.access_token,
          authPerm,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }
  } catch (e) {
    // silent failed
  }
}
