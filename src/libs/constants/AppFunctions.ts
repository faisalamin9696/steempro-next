import { AppStrings } from "./AppStrings"
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../redux/store";
import { IntrestingList } from "./AppConstants";

export function sdsWrapper(api: string): string {
    return AppStrings.sds_base_url + api
}


export async function fetchSds<T>(api: string): Promise<T> {
    const response = await fetch(sdsWrapper(api), { keepalive: true });


    // If the status code is not in the range 200-299,
    // we still try to parse and throw it.
    if (!response.ok) {
        const error: any = new Error('An error occurred while fetching the data.')
        // Attach extra info to the error object.
        error.info = await response.json()
        error.status = response.status
        throw error
    }

    const result = await response.json();

    if (validateSds(result)) {
        const parsed = mapSds(result) as T; // Assuming mapSds returns the correct type
        return parsed;
    } else {
        throw new Error(result.error!);
    }
}


export function validateSds(result: any) {
    return result.code === 0;
}

export function mapSds(response: any) {
    if (!response || typeof response !== 'object') {
        return response;
    }

    const result = response.result !== undefined ? response.result : response;

    if (!result || typeof result !== 'object') {
        return result;
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
    return IntrestingList
        .filter(p => !following?.includes(p))
        .sort(() => 0.5 - Math.random())
        .slice(0, count)
};

