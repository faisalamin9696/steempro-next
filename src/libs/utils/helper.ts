import { NavigateOptions } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { useRouter } from "next13-progressbar";

export const validateCommunity = (tag?: string): boolean => {
    if (!tag)
        return false;
    const community_regex = /hive-[1-3]\d{4,6}$/;

    return community_regex.test(tag);

}


export function abbreviateNumber(number?: number, decimalPlaces = 1, outputOnlyM: boolean = false): string | number {
    if (number === 0 || !number) return '0';

    const SI_SYMBOL = ['', 'K', 'M', 'B', 'T', 'Q'];


    const tier = Math.log10(Math.abs(number)) / 3 | 0;

    if (tier === 0) return number.toFixed(0);

    if (tier >= 3 && outputOnlyM) return `${(number / 10 ** (tier * 3)).toFixed(0)}M`;



    const suffix = SI_SYMBOL[tier];
    const scale = Math.pow(10, tier * 3);

    const scaled = number / scale;

    const decimalPart = String(scaled).substring(scaled.toString().indexOf('.') + 1);
    if (parseFloat(decimalPart) === 0) {
        decimalPlaces = 0;
    }



    let formattedNumber = scaled.toFixed(decimalPlaces);


    // Remove decimal part if it's zero


    return formattedNumber + suffix;
}
export const toBase64 = (file) =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            resolve(
                reader?.result?.toString().replace(/^data:image\/?[A-z]*;base64,/, "")
            );
        };
        reader.onerror = (error) => reject(error);
    });
export const count_words = (text: string) => {
    if (text) {
        return text.match(/\S+/g)?.length;
    } else return 0;
};


export function pushWithCtrl(event, router: {
    push: (href: string, options?: NavigateOptions) => void | Promise<boolean>;
    replace: (href: string, options?: NavigateOptions) => void | Promise<boolean>;
    back(): void;
    forward(): void;
    refresh(): void;
    prefetch(href: string, options?: undefined): void;
}, targetUrl: string, shouldRefresh?: boolean) {

    const ctrlPressed = event?.ctrlKey || false;
    if (ctrlPressed) {
        window.open(targetUrl, '_blank');
        return
    }
    router.push(targetUrl);
    if (shouldRefresh)
        router.refresh();

}


export function isNumeric(value: string): boolean {
    return /^-?\d*\.?\d+$/.test(value);
}