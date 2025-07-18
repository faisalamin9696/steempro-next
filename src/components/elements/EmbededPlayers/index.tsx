import _ from 'lodash';
import * as archiveorg from './archiveorg';
import * as bandcamp from './bandcamp';
import * as dtube from './dtube';
import * as mixcloud from './mixcloud';
import * as soundcloud from './soundcloud';
import * as spotify from './spotify';
import * as threespeak from './threespeak';
import * as truvvl from './truvvl';
import * as twitch from './twitch';
import * as vimeo from './vimeo';
import * as reddit from './reddit';
import * as gist from './gist';

const supportedProviders = {
    archiveorg,
    bandcamp,
    dtube,
    // gist,
    mixcloud,
    reddit,
    soundcloud,
    spotify,
    threespeak,
    truvvl,
    twitch,
    vimeo,
};

export default supportedProviders;

function callProviderMethod(provider, methodName, ...parms) {
    const method = _.get(provider, methodName, null);
    if (method && typeof method === 'function') {
        return method(...parms);
    }

    return false;
}

// Set only those attributes in `sandboxAttributes`, that are minimally
// required for a given provider.
// When the embedded document has the same origin as the embedding page,
// it is strongly discouraged to use both allow-scripts
// and allow-same-origin, as that lets the embedded document remove
// the sandbox attribute — making it no more secure than not using
// the sandbox attribute at all. Also note that the sandbox attribute
// is unsupported in Internet Explorer 9 and earlier.
// See https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe.
function getProviderSandboxConfig(provider) {
    const sandboxConfig = _.get(provider, 'sandboxConfig', null);
    return sandboxConfig;
}

function getIframeDimensions(large) {
    return {
        width: large ? 640 : 480,
        height: large ? 360 : 270,
    };
}

/**
 * Allow iFrame in the Markdown if the source URL is allowed
 * @param url
 * @returns { boolean | { providerId: string, sandboxAttributes: string[], useSandbox: boolean, validUrl: string }}
 */
export function validateIframeUrl(url, large = true, width = null, height = null) {
    if (!url) {
        return {
            validUrl: false,
        };
    }

    const providersKeys = Object.keys(supportedProviders);
    for (let pi = 0; pi < providersKeys.length; pi += 1) {
        const providerId = providersKeys[pi];
        const provider = supportedProviders[providerId];

        const validUrl = callProviderMethod(provider, 'validateIframeUrl', url);

        let iframeDimensions;
        iframeDimensions = callProviderMethod(provider, 'getIframeDimensions', large, url, width, height);
        if (!iframeDimensions) {
            iframeDimensions = getIframeDimensions(large);
        }

        if (validUrl !== false) {
            const sandboxConfig = getProviderSandboxConfig(provider);
            return {
                providerId,
                sandboxAttributes: sandboxConfig.sandboxAttributes || [],
                useSandbox: sandboxConfig.useSandbox,
                width: iframeDimensions.width.toString(),
                height: iframeDimensions.height.toString(),
                validUrl,
            };
        }
    }

    return {
        validUrl: false,
    };
}

/**
 * Rewrites the embedded URL to a normalized format
 * @param url
 * @returns {boolean|*}
 */
export function normalizeEmbedUrl(url) {
    const providersKeys = Object.keys(supportedProviders);
    for (let pi = 0; pi < providersKeys.length; pi += 1) {
        const providerName = providersKeys[pi];
        const provider = supportedProviders[providerName];

        const validEmbedUrl = callProviderMethod(provider, 'normalizeEmbedUrlFn', url);

        if (validEmbedUrl === true) {
            console.log(`Found a valid ${provider.id} embedded URL`);
            return validEmbedUrl;
        }
    }

    return false;
}

/**
 * Replaces the URL with a custom Markdown for embedded players
 * @param child
 * @param links
 * @param images
 * @returns {*}
 */
export function embedNode(child, links, images) {
    const providersKeys = Object.keys(supportedProviders);
    for (let pi = 0; pi < providersKeys.length; pi += 1) {
        const providerName = providersKeys[pi];
        const provider = supportedProviders[providerName];

        const newChild = callProviderMethod(provider, 'embedNode', child, links, images);
        if (newChild) {
            child = newChild;
        }
    }

    return child;
}

/**
 * Returns the provider config by ID
 * @param id
 * @returns {null|{normalizeEmbedUrlFn, validateIframeUrlFn, id: string, genIframeMdFn, embedNodeFn}|{normalizeEmbedUrlFn, validateIframeUrlFn, id: string, genIframeMdFn, embedNodeFn}|{normalizeEmbedUrlFn: null, validateIframeUrlFn, id: string, genIframeMdFn: null, embedNodeFn: null}|{normalizeEmbedUrlFn, validateIframeUrlFn, id: string, genIframeMdFn, embedNodeFn}|{normalizeEmbedUrlFn, validateIframeUrlFn, id: string, genIframeMdFn, embedNodeFn}}
 */
function getProviderById(id) {
    const providersKeys = Object.keys(supportedProviders);
    for (let pi = 0; pi < providersKeys.length; pi += 1) {
        const providerName = providersKeys[pi];
        if (providerName === id) {
            return supportedProviders[providerName];
        }
    }

    return null;
}

/**
 * Returns all providers IDs
 * @returns {(string)[]}
 */
function getProviderIds() {
    return Object.keys(supportedProviders);
}

/**
 * Replaces ~~~ embed: Markdown code to an iframe MD
 * @param section
 * @param idx
 * @param large
 * @returns {null|{markdown: null, section: string}}
 */
export function generateMd(section, idx, large) {
    let markdown = null;
    const supportedProvidersIds = getProviderIds();
    const regexString = `^([A-Za-z0-9\\?\\=\\_\\-\\/\\.]+) (${supportedProvidersIds.join('|')})\\s?(.*?) ~~~`;
    const regex = new RegExp(regexString);
    const match = section.match(regex);

    if (match && match.length >= 3) {
        const id = match[1];
        const type = match[2];
        const metadataString = match[3];
        let metadata;
        if (metadataString.indexOf('metadata:') === -1) {
            metadata = match[3] ? parseInt(match[3]) : 0;
        } else {
            metadata = metadataString.substring(9);
        }

        const provider = getProviderById(type);
        if (provider) {
            let iframeDimensions = callProviderMethod(provider, 'getIframeDimensions', large, id);
            if (!iframeDimensions) {
                iframeDimensions = getIframeDimensions(large);
            }

            markdown = callProviderMethod(
                provider,
                'genIframeMd',
                idx,
                id,
                iframeDimensions.width,
                iframeDimensions.height,
                metadata
            );
        } else {
            console.error('MarkdownViewer unknown embed type', type);
        }

        if (match[3]) {
            section = section.substring(`${id} ${type} ${metadataString} ~~~`.length);
        } else {
            section = section.substring(`${id} ${type} ~~~`.length);
        }

        return {
            section,
            markdown,
        };
    }

    return null;
}

/**
 * Pre-process HTML codes from the Markdown before it gets transformed
 * @param html
 * @returns {*}
 */
export function preprocessHtml(html) {
    const providersKeys = Object.keys(supportedProviders);
    for (let pi = 0; pi < providersKeys.length; pi += 1) {
        const providerName = providersKeys[pi];
        const provider = supportedProviders[providerName];
        const preprocessHtmlFn = _.get(provider, 'preprocessHtml');
        if (preprocessHtmlFn) {
            html = preprocessHtmlFn(html);
        }
    }
    return html;
}
