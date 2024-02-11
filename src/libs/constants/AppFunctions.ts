import { AppStrings } from "./AppStrings"
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../redux/store";
import { intrestingList } from "./AppConstants";
import { getFirestore, doc, getDoc, DocumentSnapshot, DocumentData } from "firebase/firestore";

export function sdsWrapper(api: string): string {
    return AppStrings.sds_base_url + api
}


export async function fetchSds<T>(api: string): Promise<T> {
    const response = await fetch(sdsWrapper(api));
    if (response.ok) {
        const result = await response.json();
        if (validateSds(result)) {
            const parsed = mapSds(result) as T; // Assuming mapSds returns the correct type
            return parsed;
        } else {
            throw new Error(result.error!);
        }
    } else {
        throw new Error(`HTTP error: ${response.status}`);
    }
}


export function validateSds(result: any) {
    return result.code === 0;
}

export function mapSds(response: any) {
    const result = response.result;
    if (!result) {
        return response;
    }

    const { cols, rows } = result;
    if (!cols) {
        return rows || result;
    }

    const keys = Object.keys(cols);
    const mapped_data: any[] = [];

    result.rows.forEach(row => {
        const values: any = Object.values(row);
        const mapped = values.reduce(
            (a, it, index) => ({ ...a, [keys[index]]: it }),
            {},
        );
        mapped_data.push(mapped);
    });

    return mapped_data;
}

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export const useAppDispatch: () => AppDispatch = useDispatch

export function awaitTimeout(seconds: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}

export const filterRecommendations = (following: string[], count = 4) => {
    return intrestingList
        .filter(p => !following?.includes(p))
        .sort(() => 0.5 - Math.random())
        .slice(0, count)
};


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

