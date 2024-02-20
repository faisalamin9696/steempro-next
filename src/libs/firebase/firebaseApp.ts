
import { getAuth, signInAnonymously } from "firebase/auth";
import {
    getFirestore, doc, getDoc, setDoc, arrayUnion
} from "firebase/firestore";
import { getServerSession } from "next-auth";


export async function getFirestoreDocument(collection, id) {
    const db = getFirestore()

    let docRef = doc(db, collection, id);

    let result: any = null;
    let error: any = null;

    try {
        result = (await getDoc(docRef))?.data();
    } catch (e) {
        error = e;
    }

    return { result, error };
}

export async function getAnnouncements(): Promise<{ title: string, description: string, authPerm: string }[]> {
    const { result, error } = await getFirestoreDocument('App', 'announcement_posts');
    return result || [];
}


export async function getPromotions() {
    const { result, error } = await getFirestoreDocument('App', 'promoted_posts');
    return result || [];
}



export async function getPostsViews(authPerm: string) {
    const { result, error } = await getFirestoreDocument('Views', 'posts');
    return result?.[authPerm]?.length;
}


type Props = {
    author?: string;
    permlink?: string;
    authPerm?: string;
    comment?: Post | Feed;
} & (
        { author: string; permlink: string } |
        { authPerm: string } |
        { comment: Post | Feed }
    );


export async function updatePostView(props: Props) {
    let authPerm;
    if (!props.authPerm)
        authPerm = `${props.author || props.comment?.author}/${props.permlink || props.comment?.permlink}`;
    else authPerm = props.authPerm;

    const db = getFirestore();
    const auth = getAuth();
    const docRef = doc(db, 'Views', 'posts');

    try {
        let credentials;
        if (!auth?.currentUser) {
            credentials = await signInAnonymously(auth);
            const data = { [authPerm]: arrayUnion(credentials.user.uid) };
            const res = await setDoc(docRef, data, { merge: true });
        } else {
            const data = { [authPerm]: arrayUnion(auth.currentUser.uid) };
            const res = await setDoc(docRef, data, { merge: true });

        }
    } catch (e) {
        // silent failed

    }
}