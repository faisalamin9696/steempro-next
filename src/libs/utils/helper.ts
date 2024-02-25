export const validateCommunity = (tag?: string): boolean => {
    if (!tag)
        return false;
    const community_regex = /hive-[1-3]\d{4,6}$/;

    return community_regex.test(tag);

}

export function abbreviateNumber(number?: number, floatFixes = 0): string {
    if (!number)
        return '0'
    var SI_SYMBOL = ['', 'k', 'M', 'G', 'T', 'P', 'E'];

    // what tier? (determines SI symbol)
    var tier = (Math.log10(Math.abs(number)) / 3) | 0;

    // if zero, we don't need a suffix
    if (tier === 0 || tier === -1) return number?.toFixed(floatFixes);

    // get suffix and determine scale
    var suffix = SI_SYMBOL[tier];
    var scale = Math.pow(10, tier * 3);

    // scale the number
    var scaled = number / scale;

    // format number and add suffix
    return scaled.toFixed(floatFixes) + suffix;
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
