import React, { useState } from 'react';

interface Props {
    youTubeId: string;
    width?: number;
    height?: number;
    startTime?: number;
    dataParams?: string;
}

function YoutubePreview(props: Props): React.ReactElement {
    const {
        youTubeId,
        width = 640,
        height = 360,
        startTime = 0,
        dataParams = 'enablejsapi=0&rel=0&origin=https://steempro.com',
    } = props;
    const [play, setPlay] = useState(true);

    function onPlay() {
        setPlay(true);
    }

    if (!play) {
        const thumbnail =
            width <= 320
                ? 'mqdefault.jpg'
                : width <= 480
                    ? 'hqdefault.jpg'
                    : '0.jpg';
        const previewLink = `https://img.youtube.com/vi/${youTubeId}/${thumbnail}`;

        return React.createElement(
            'div',
            {
                className: 'videoWrapper youtube',
                onClick: onPlay,
                style: { backgroundImage: 'url(' + previewLink + ')' },
            },
            React.createElement('div', { className: 'play' })
        );
    }

    const autoPlaySrc = `https://www.youtube.com/embed/${youTubeId}?autoplay=1&autohide=1&${dataParams}&start=${startTime}`;

    return React.createElement(
        'div',
        { className: 'videoWrapper' },
        React.createElement('iframe', {
            width,
            height,
            src: autoPlaySrc,
            allowFullScreen: true,
        })
    );
}

export default YoutubePreview;