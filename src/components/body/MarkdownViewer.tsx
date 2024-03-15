
import React, { memo, useState } from 'react'
import { Remarkable } from 'remarkable';
import { ParsedBody } from './ParsedBody';
import YoutubePreview from '../YoutubePreview';
import CryptoJS from 'crypto-js';
import SanitizeConfig, { noImageText } from './SanitizeConfig';
import HtmlReady from './htmlReady';
import sanitize from 'sanitize-html';
import { replaceOldDomains } from '@/libs/utils/Links';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

const remarkable = new Remarkable({
    html: true, // remarkable renders first then sanitize runs...
    breaks: true,
    typographer: false, // https://github.com/jonschlinkert/remarkable/issues/142#issuecomment-221546793
    quotes: '“”‘’',
});

const remarkableToSpec = new Remarkable({
    html: true,
    breaks: false, // real markdown uses \n\n for paragraph breaks
    typographer: false,
    quotes: '“”‘’',
});


interface Props {
    // HTML properties
    text: string,
    className?: string,
    highQualityPost?: boolean,
    noImage?: boolean,
    allowDangerousHTML?: boolean,
    hideImages?: boolean,
    breaks?: boolean,
    isProxifyImages?: boolean
    isNsfw?: boolean;

};
export default memo(function MarkdownViewer(props: Props) {
    const {
        allowDangerousHTML = false,
        breaks = true,
        className,
        hideImages = false,
        isProxifyImages, noImage, highQualityPost,
        isNsfw = false,

    } = props;
    let { text } = props;

    const large = true;

    const [allowNoImage, setAllowNoImage] = useState(props.noImage);
    if (!text) text = ''; // text can be empty, still view the link meta data

    // text = renderPostBody(text, false, true)

    let html = false;
    // See also ReplyEditor isHtmlTest
    const m = text.match(/^<html>([\S\s]*)<\/html>$/);
    if (m && m?.length === 2) {
        html = true;
        text = m[1];
    } else {
        // See also ReplyEditor isHtmlTest
        html = /^<p>[\S\s]*<\/p>/.test(text);
    }

    // Strip out HTML comments. "JS-DOS" bug.
    text = text.replace(
        /<!--([\s\S]+?)(-->|$)/g,
        '(html comment removed: $1)'
    );



    let renderer = remarkableToSpec;
    if (breaks === true) {
        renderer = remarkable;
    }

    let renderedText: string = html ? text : renderer.render(text);

    // If content isn't wrapped with an html element at this point, add it.
    if (!(renderedText.indexOf('<html>') !== 0)) {
        renderedText = '<html>' + renderedText + '</html>';
    }

    renderedText = replaceOldDomains(renderedText);

    if (renderedText)
        renderedText = HtmlReady(renderedText, {
            hideImages,
            isProxifyImages,
        }).html;


    // Complete removal of javascript and other dangerous tags..
    // The must remain as close as possible to dangerouslySetInnerHTML
    let cleanText = renderedText;
    if (allowDangerousHTML) {
        console.log('WARN\tMarkdownViewer rendering unsanitized content');
    } else {
        cleanText = sanitize(
            renderedText,
            SanitizeConfig({
                large: large,
                highQualityPost: true,
                noImage: noImage && allowNoImage,
            })
        );
    }

    if (/<\s*script/gi.test(cleanText)) {
        // Not meant to be complete checking, just a secondary trap and red flag (code can change)
        console.error(
            'Refusing to render script tag in post text',
            cleanText
        );
        return <div />;
    }

    const noImageActive = cleanText.indexOf(noImageText) !== -1;

    // In addition to inserting the youtube component, this allows
    // react to compare separately preventing excessive re-rendering.
    let idx = 0;
    const sections: any[] = [];

    // HtmlReady inserts ~~~ embed:${id} type ~~~
    for (let section of cleanText.split('~~~ embed:')) {
        const match = section.match(
            /^([A-Za-z0-9\?\=\_\-\/\.]+) (youtube|vimeo|twitch|dtube|threespeak)\s?(\d+)? ~~~/
        );
        if (match && match?.length >= 3) {

            const id = match[1];
            const type = match[2];
            const startTime = match[3] ? parseInt(match[3]) : 0;
            const w = large ? 640 : 480,
                h = large ? 360 : 270;

            if (type === 'youtube') {
                sections.push(
                    <YoutubePreview
                        key={id}
                        width={w}
                        height={h}
                        youTubeId={id}
                        startTime={startTime}
                    />
                );
            } else if (type === 'threespeak') {
                const url = `https://3speak.online/embed?v=${id}`;
                sections.push(
                    <div className="videoWrapper" key={id}>
                        <iframe
                            src={url}
                            width={w}
                            height={h}
                            allowFullScreen
                            title={`ThreeSpeak video ${id}`}
                        />
                    </div>
                );
            } else if (type === 'vimeo') {
                const url = `https://player.vimeo.com/video/${id}#t=${startTime
                    }s`;
                sections.push(
                    <div className="videoWrapper" key={id}>
                        <iframe
                            src={url}
                            width={w}
                            height={h}
                            // frameBorder="0"
                            // webkitallowfullscreen="true"
                            // mozallowfullscreen="true"
                            allowFullScreen
                            title={`Vimeo video ${id}`}
                        />
                    </div>
                );
            } else if (type === 'twitch') {
                const url = `https://player.twitch.tv/${id}`;
                sections.push(
                    <div className="videoWrapper" key={id}>
                        <iframe
                            src={url}
                            width={w}
                            height={h}
                            // frameBorder="0"
                            // webkitallowfullscreen="true"
                            // mozallowfullscreen="true"
                            allowFullScreen
                            title={`Twitch video ${id}`}
                        />
                    </div>
                );
            } else if (type === 'dtube') {
                const url = `https://emb.d.tube/#!/${id}`;
                sections.push(
                    <div className="videoWrapper" key={id}>
                        <iframe
                            src={url}
                            width={w}
                            height={h}
                            // frameBorder="0"
                            // webkitallowfullscreen="true"
                            // mozallowfullscreen="true"
                            allowFullScreen
                            title={`DTube video ${id}`}
                        />
                    </div>
                );
            } else {
                console.error('MarkdownViewer unknown embed type', type);
            }
            if (match[3]) {
                section = section.substring(
                    `${id} ${type} ${startTime} ~~~`.length
                );
            } else {
                section = section.substring(`${id} ${type} ~~~`.length);
            }
            if (section === '') continue;
        }
        const hash = CryptoJS.MD5(`index-${idx++}`).toString();

        sections.push(
            <ParsedBody key={hash} body={section} isNsfw={isNsfw} />
        );
    }


    return (<div className={twMerge('markdown-body  w-full', className)}>
        {sections}
        {noImageActive &&
            allowNoImage && (
                <div
                    onClick={() => setAllowNoImage(false)}
                    className="MarkdownViewer__negative_group"
                >
                    {'Hidden due to low rating'}
                    <button
                        style={{ marginBottom: 0 }}
                        className="button hollow tiny float-right"
                    >
                        {'Show'}
                    </button>
                </div>
            )}
    </div>

    )
})

