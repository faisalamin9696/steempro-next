import striptags from 'striptags';
import { Remarkable } from 'remarkable';

const remarkable = new Remarkable({ html: true });
import textEllipsis from '@/libs/utils/ellibsis';
import { FeedBodyLength } from '../constants/AppConstants';


function decodeEntities(body: string): string {
    return body?.replace(/&lt;/g, '<')?.replace(/&gt;/g, '>');
}



export const postSummary = (text: string): string => {
    let body = striptags(remarkable.render(striptags(decodeEntities(text || ''))));
    body = body?.replace(/(?:https?|ftp):\/\/[\S]+/g, '');

    // If body consists of whitespace characters only skip it.
    if (!body?.replace(/\s/g, '')?.length) {
        return ''
    }

    return textEllipsis(body, FeedBodyLength)

};


