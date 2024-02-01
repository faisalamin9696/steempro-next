import { AppStrings } from "./AppStrings"
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../redux/store";
import { toast } from "sonner";

export function sdsWrapper(api: string): string {
    return AppStrings.sds_base_url + api
}


export async function fetchSds(api: string): Promise<any> {

    const response = await fetch(sdsWrapper(api));
    if (response.ok) {
        const result = await response.json();
        if (validateSds(result)) {
            const parsed = mapSds(result);
            return parsed;
        } else {
            // if the response is not valid, throw an error with the message from the server
            throw new Error(result.error!);
        }
    } else {
        // if the response is not successful, throw an error with the HTTP status code
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