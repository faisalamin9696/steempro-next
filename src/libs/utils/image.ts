import { filesize } from "filesize";
import { proxifyImageUrl } from './ProxifyUrl';
import { AppStrings } from "../constants/AppStrings";

const BASE_IMAGE_URL = AppStrings.image_hosting[0];

// get the image from meta data
export const catchImageFromMetadata = (
    meta: any,
    format = 'match',
    thumbnail = false,
) => {
    if (!meta)
        return null
    format = 'match';
    meta = JSON.parse(JSON.stringify(meta));
    if (meta && meta.image) {
        const images = meta.image;
        // console.log('images : ',images);

        if (thumbnail) {
            return proxifyImageUrl(images[0]);
        }
        return proxifyImageUrl(images[0]);
    }
    return null;
};

export const getResizedImage = (url: string, size = 600, format = 'match') => {
    //TODO: implement fallback onError, for imagehoster is down case
    format = 'match';
    if (!url) {
        return '';
    }
    return proxifyImageUrl(url);
};

export const getResizedAvatar = (author?: string, sizeString: 'small' | 'medium' | 'large' = 'small') => {
    if (!author) {
        return '';
    }
    // author = author.replace('@', '').toLowerCase().trim();
    return `${BASE_IMAGE_URL}/u/${author}/avatar/${sizeString}`;
};

export const getCoverImageUrl = (meta: any) => {
    if (!meta) {
        return null;
    }
    try {
        if (typeof meta === 'string') meta = JSON.parse(meta);
        return meta.profile.cover_image;
    } catch (err) {
        return null;
    }
};


export const getPostThumbnail = (json_images?: string) => {
    if (!json_images) {
        return null;
    }

    try {
        const metadata: string[] = JSON.parse(json_images);
        if (metadata?.length <= 0) {
            return null;
        }
        const thumbnail = metadata[0];
        return getProxyImageURL(thumbnail);
    } catch (error) {
        // console.error('Failed to get post thumbnail:', error);
        return null;
    }
};


const IMG_PROXY = 'https://steemitimages.com/0x0/';
const IMG_PROXY_PREVIEW = 'https://steemitimages.com/600x800/';
const IMG_PROXY_SMALL = 'https://steemitimages.com/40x40/';

export const MAXIMUM_UPLOAD_SIZE = 15728640;
export const MAXIMUM_UPLOAD_SIZE_HUMAN = filesize(MAXIMUM_UPLOAD_SIZE);

export const getProxyImageURL = (url: string, type: 'preview' | 'small' | 'large' = 'preview') => {
    if (url?.indexOf('https://ipfs.busy.org') === 0 || url?.indexOf('https://gateway.ipfs.io') === 0) {
        return url;
    } else if (type === 'preview') {
        return `${IMG_PROXY_PREVIEW}${url}`;
    } else if (type === 'small') {
        return `${IMG_PROXY_SMALL}${url}`;
    }
    return `${IMG_PROXY}${url}`;
};

export const isValidImage = (file: any) => file.type.match('image/.*') && file.size <= MAXIMUM_UPLOAD_SIZE;

export default null;

