import { useState, useEffect, useRef } from 'react';
import EditorToolbar from './EditorToolbar';
import Dropzone from 'react-dropzone';
import { Textarea } from "@nextui-org/react";
import clsx from 'clsx';
import { KeyboardEvent } from "react";
import { MAXIMUM_UPLOAD_SIZE, isValidImage } from '@/libs/utils/image';

interface EditorProps {
    value: string,
    onChange: (value: string) => void,
    onImageUpload: (blon: any,
        insertionStatus: (image: any, imageName: string) => void,
        setImageState: () => void) => void,
    onImageInvalid: () => void,
    inputClass?: string;
    rows?: number;
}


const EditorInput = (props: EditorProps) => {
    const {
        value,
        onImageUpload,
        onImageInvalid,
        onChange,
        inputClass,
        rows,
    } = props;
    const [imageState, setImageState] = useState(
        {
            imageUploading: false,
            dropzoneActive: false,
        }
    );
    const postInput = useRef<any>(null);

    const { dropzoneActive } = imageState;
    const postBodyRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (postInput) {
            postInput?.current?.addEventListener('paste', handlePastedImage);
        }
    });


    function setValue(value: string, start?: number, end?: number) {
        onChange(value);
        if (start && end) {
            setTimeout(() => {
                postInput?.current?.setSelectionRange(start, end);
            }, 0);
        }
    }

    function insertAtCursor(before: string, after: string, deltaStart = 0, deltaEnd = 0) {
        if (!postInput) return;

        const { value } = props;

        const startPos = postInput?.current?.selectionStart;
        const endPos = postInput?.current?.selectionEnd;
        const newValue =
            value.substring(0, startPos) +
            before +
            value.substring(startPos, endPos) +
            after +
            value.substring(endPos, value.length);

        setValue(newValue, startPos + deltaStart, endPos + deltaEnd);
    }

    function disableAndInsertImage(image: any, imageName = 'image') {
        setImageState({
            ...imageState,
            imageUploading: false,
        });
        insertImage(image, imageName);
    }

    function insertImage(image: any, imageName = 'image') {
        if (!postInput) return;

        const { value } = props;

        const startPos = postInput?.current?.selectionStart;
        const endPos = postInput?.current?.selectionEnd;
        const imageText = `![${imageName}](${image})\n`;
        const newValue = `${value.substring(0, startPos)}${imageText}${value.substring(
            endPos,
            value.length,
        )}`;
        setValue(newValue, startPos + imageText.length, startPos + imageText.length);
    }


    const shortcutHandler = {
        h1: () => insertCode('h1'),
        h2: () => insertCode('h2'),
        h3: () => insertCode('h3'),
        h4: () => insertCode('h4'),
        h5: () => insertCode('h5'),
        h6: () => insertCode('h6'),
        bold: () => insertCode('b'),
        italic: () => insertCode('i'),
        quote: () => insertCode('q'),
        code: () => insertCode('code'),
        link: () => insertCode('link'),
        image: () => insertCode('image'),
        snip: () => insertCode('snip'),
        justify: () => insertCode('justify'),
        center: () => insertCode('center'),
    };


    function hotKeyHandler(e: KeyboardEvent<HTMLDivElement>) {
        // allow only Alt key
        if (!e.altKey) {
            return;
        }
        e.preventDefault();

        switch (e.key) {
            case "1":
                shortcutHandler.h1();
                break;
            case "2":
                shortcutHandler.h2();
                break;
            case "3":
                shortcutHandler.h3();
                break;
            case "3":
                shortcutHandler.h4();
                break;
            case "b":
                shortcutHandler.bold();
                break;
            case "i":
                shortcutHandler.italic();
                break;
            case "q":
                shortcutHandler.quote();
                break;
            case "c":
                shortcutHandler.code();
                break;

            case "link":
                shortcutHandler.link();
                break;

            case "s":
                shortcutHandler.snip();
                break;

            case "j":
                shortcutHandler.justify();
                break;

            case "e":
                shortcutHandler.center();
                break;
            // case "t":
            //     detectEvent("table");
            //     break;
            // case "k":
            //     detectEvent("link");
            //     break;
            // case "c":
            //     detectEvent("codeBlock");
            //     break;
            // case "d":
            //     detectEvent("image");
            //     break;
            // case "m":
            //     detectEvent("blockquote");
            //     break;
            default:
                return;
        }
    }



    function insertCode(type: string) {

        if (!postInput) return;
        // postInput?.current?.focus();

        switch (type) {
            case 'h1':
                insertAtCursor('# ', '', 2, 2);
                break;
            case 'h2':
                insertAtCursor('## ', '', 3, 3);
                break;
            case 'h3':
                insertAtCursor('### ', '', 4, 4);
                break;
            case 'h4':
                insertAtCursor('#### ', '', 5, 5);
                break;
            case 'b':
                insertAtCursor('**', '**', 2, 2);
                break;
            case 'i':
                insertAtCursor('*', '*', 1, 1);
                break;
            case 'q':
                insertAtCursor('> ', '', 2, 2);
                break;
            case 'code':
                insertAtCursor('<code>', '</code>', 1, 1);
                break;
            case 'link':
                insertAtCursor('[', '](url)', 1, 1);
                break;
            case 'image':
                handleImageChange(null);
                // insertAtCursor('![', '](url)', 2, 2);
                break;
            case 'snip':
                alert('Snippets')
                break;

            case 'justify':
                insertAtCursor('<div class="text-justify">\n\n', '\n</div>', 2, 2);
                break;

            case 'center':
                insertAtCursor('<center>\n', '\n</center>', 2, 2);
                break;
            default:
                break;
        }

    }


    function handlePastedImage(e: any) {
        if (e.clipboardData && e.clipboardData.items) {
            const items = e.clipboardData.items;
            Array.from(items).forEach((item: any) => {
                if (item.kind === 'file') {
                    e.preventDefault();

                    const blob = item.getAsFile();

                    if (!isValidImage(blob)) {
                        onImageInvalid();
                        return;
                    };

                    setImageState({
                        ...imageState,
                        imageUploading: true,
                    });

                    onImageUpload(blob, disableAndInsertImage, () =>
                        setImageState({
                            ...imageState,
                            imageUploading: false,
                        })

                    );
                }
            });
        }
    }

    function handleImageChange(e: any) {
        if (e.target.files && e.target.files[0]) {
            if (!isValidImage(e.target.files[0])) {
                onImageInvalid();
                return;
            }

            setImageState({
                ...imageState,
                imageUploading: true,
            });


            onImageUpload(e.target.files[0], disableAndInsertImage, () =>
                setImageState({
                    ...imageState,
                    imageUploading: false,
                })
            );
            e.target.value = '';
        }
    }

    function handleDrop(files: any[]) {
        if (files.length === 0) {
            setImageState({
                ...imageState,
                dropzoneActive: false,
            });
            return;
        }

        setImageState({
            imageUploading: true,
            dropzoneActive: false,
        });

        let callbacksCount = 0;
        Array.from(files).forEach(item => {
            onImageUpload(
                item,
                (image: any, imageName: string) => {
                    callbacksCount += 1;
                    insertImage(image, imageName);
                    if (callbacksCount === files?.length) {

                        setImageState({
                            ...imageState,
                            imageUploading: false,
                        });

                    }
                },
                () => {
                    setImageState({
                        ...imageState,
                        imageUploading: false,
                    });


                },
            );
        });
    }


    function handleDragEnter() {
        setImageState({
            ...imageState,
            dropzoneActive: true,
        });
    }

    function handleDragLeave() {
        setImageState({
            ...imageState,
            dropzoneActive: false,
        });
    }

    function handleChange(text: string) {
        setValue(text);
    }

    return (
        <div>
            <Dropzone onDrop={handleDrop}

                noClick
                // accept="image/*"
                maxSize={MAXIMUM_UPLOAD_SIZE}
                onDropRejected={onImageInvalid}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}


            >
                {({ getRootProps, getInputProps }) => (
                    <section>
                        <div  >
                            {dropzoneActive && (
                                <div className="EditorInput__dropzone">
                                    <div>
                                        <i className="iconfont icon-picture" />
                                        <p>Drop your images here</p>
                                    </div>
                                </div>
                            )}


                            <div className="body-input"
                                onKeyDown={hotKeyHandler}
                                ref={postBodyRef}>

                                <Textarea
                                    ref={postInput}
                                    label={<EditorToolbar onSelect={insertCode}
                                        className={'mb-4'} />}
                                    radius='sm'
                                    variant='flat'
                                    placeholder={'Write something...'}
                                    disableAnimation
                                    disableAutosize
                                    className='text-default-900 '
                                    fullWidth
                                    height={'100%'}
                                    classNames={{
                                        mainWrapper: '',
                                        base: clsx("h-full ", inputClass),
                                        input: clsx("resize-y", inputClass),
                                        label: 'md-toolbar'
                                    }}
                                    value={value}
                                    onValueChange={handleChange}
                                    isMultiline
                                    rows={rows ?? 10}

                                />
                            </div>
                        </div>
                    </section>
                )}
            </Dropzone>

        </div>
    );
}

export default EditorInput