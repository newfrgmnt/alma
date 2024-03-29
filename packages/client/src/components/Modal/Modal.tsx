import { CloseOutlined } from '@mui/icons-material';
import { motion } from 'framer-motion';
import * as React from 'react';

import { ModalProps } from './Modal.types';
import { Button } from '../Button/Button';
import { Portal } from '../Portal/Portal';

export const Modal = ({ modal: { title, children, actions, id }, onClose }: ModalProps) => {
    const closeOnEscapeKey = React.useCallback(
        (e: KeyboardEvent) => (e.key === 'Escape' ? onClose?.(e) : null),
        [onClose]
    );

    React.useEffect(() => {
        document.body.classList.add('modal-open');
        document.body.addEventListener('keydown', closeOnEscapeKey);

        return () => {
            document.body.removeEventListener('keydown', closeOnEscapeKey);
            document.body.classList.remove('modal-open');
        };
    }, [closeOnEscapeKey]);

    return (
        <Portal wrapperId={id}>
            <motion.div
                className="flex flex-col justify-center items-center fixed inset-0 z-50 overflow-hidden"
                initial={{ backgroundColor: 'rgba(0, 0, 0, 0)' }}
                animate={{ backgroundColor: 'rgba(0, 0, 0, .5)' }}
            >
                <motion.div
                    className="flex flex-col rounded-3xl text-sm shadow-xl bg-neutral-700"
                    style={{ width: 600 }}
                    initial={{ opacity: 0, transform: 'translateY(-10px)' }}
                    animate={{ opacity: 1, transform: 'translateY(0)' }}
                >
                    <div className="relative pt-8 pr-8">
                        <div className="absolute text-lg text-center w-full font-medium text-slate-300">{title}</div>
                        <div
                            className="absolute right-8 hover:text-slate-300 transition-colors cursor-pointer z-10"
                            onClick={onClose}
                        >
                            <CloseOutlined />
                        </div>
                    </div>
                    <div className="relative flex flex-col pt-14 pb-4 max-h-112 overflow-y-auto">{children}</div>
                    {actions && (
                        <div className="flex flex-row justify-center items-center py-8 px-12 [&>*]:mr-4 [&>*:last-child]:mr-0">
                            {actions.map((action, index) => (
                                <Button key={index} {...action} />
                            ))}
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </Portal>
    );
};
