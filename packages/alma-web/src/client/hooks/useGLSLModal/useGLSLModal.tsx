import { noop } from 'lodash';
import * as React from 'react';

import { TextArea } from '../../components/TextArea/TextArea';
import { GLSL_EDITOR_MODAL_ID } from '../../constants/modals';
import { ModalContext } from '../../providers/ModalProvider/ModalProvider';
import { IGLSLModalContentProps, IGLSLModalOpenOptions } from './useGLSLModal.types';

export const GLSLModalContent = ({ onSave, onCancel }: IGLSLModalContentProps) => {
    const [glsl, setGLSL] = React.useState('');
    const modal = React.useContext(ModalContext);

    const onChange = React.useCallback(
        (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            const code = e.target.value;
            setGLSL(code);

            modal.update({
                actions: [
                    {
                        label: 'Save',
                        disabled: code.length < 1,
                        onPress: () => {
                            modal.close(GLSL_EDITOR_MODAL_ID);
                            onSave?.(code);
                        }
                    },
                    {
                        label: 'Cancel',
                        onPress: () => {
                            modal.close(GLSL_EDITOR_MODAL_ID);
                            onCancel?.(code);
                        }
                    }
                ]
            });
        },
        [modal]
    );

    return (
        <>
            <TextArea placeholder="Define a GLSL Function" value={glsl} onChange={onChange} />
        </>
    );
};

export const useGLSLModal = () => {
    const modal = React.useContext(ModalContext);

    const open = React.useCallback(
        ({ onSave, onCancel }: IGLSLModalOpenOptions) => {
            modal.queue({
                id: GLSL_EDITOR_MODAL_ID,
                title: 'Edit GLSL',
                children: <GLSLModalContent onSave={onSave} onCancel={onCancel} />,
                actions: [
                    { label: 'Save', disabled: true, onPress: noop },
                    {
                        label: 'Cancel',
                        onPress: () => {
                            modal.close(GLSL_EDITOR_MODAL_ID);
                            onCancel?.('');
                        }
                    }
                ]
            });
        },
        [modal]
    );

    return {
        open,
        close: modal.close
    };
};