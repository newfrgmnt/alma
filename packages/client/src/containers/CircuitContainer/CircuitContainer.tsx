import { useMutation, useQuery } from '@apollo/client';
import { Node } from '@usealma/graph';
import { ClassConstructor } from '@usealma/webgl';
import clsx from 'clsx';
import { AnimatePresence } from 'framer-motion';
import { debounce } from 'lodash';
import { reaction } from 'mobx';
import { observer } from 'mobx-react-lite';
import * as React from 'react';

import { ICircuitContainerProps, IConnectionsProps } from './CircuitContainer.types';
import { Circuit } from '../../components/Circuit/Circuit';
import { CIRCUIT_SIZE } from '../../constants/circuit';
import { useCircuit } from '../../hooks/useCircuit/useCircuit';
import { useKeyboardActions } from '../../hooks/useKeyboardActions/useKeyboardActions';
import { useMousePosition } from '../../hooks/useMousePosition/useMousePosition';
import { normalizeBounds } from '../../utils/bounds/bounds';
import { nodesHierarchy } from '../../utils/nodes/nodes';
import { NodeContainer } from '../NodeContainer/NodeContainer';
import { UPDATE_LAYER_MUTATION } from '~/apollo/mutations';
import { LAYER_QUERY } from '~/apollo/queries';
import { Connection } from '~/components/Circuit/Connection/Connection';
import { ContextMenuContainer } from '~/components/Circuit/ContextMenu/ContextMenuContainer/ContextMenuContainer';
import { useCreateNode } from '~/hooks/useCreateNode/useCreateNode';
import { useProject } from '~/providers/ProjectProvider/ProjectProvider';
import { Point } from '~/types';
import { toCartesianPoint } from '~/utils/coordinates/coordinates';

const Nodes = observer(() => {
    const circuit = useCircuit();

    return (
        <AnimatePresence>
            {Array.from(circuit.context?.nodes.values() || []).map(node => (
                <NodeContainer key={node.id} node={node} />
            ))}
        </AnimatePresence>
    );
});

const Connections = observer(({ mousePosition }: IConnectionsProps) => {
    const ref = React.useRef<SVGSVGElement>(null);
    const [mouseState, setMouseState] = React.useState<'idle' | 'down' | 'move'>('idle');
    const circuit = useCircuit();

    const onMouseDown = React.useCallback(() => {
        if (mouseState === 'idle') {
            setMouseState('down');
        }
    }, [mouseState]);

    const onMouseMove = React.useCallback(() => {
        if (mouseState === 'down') {
            setMouseState('move');
        }
    }, [mouseState]);

    const onMouseUp = React.useCallback(() => {
        setMouseState('idle');
    }, []);

    const onClick = React.useCallback(
        (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
            if (ref.current === e.target && mouseState === 'down') {
                circuit.setSelectedNodes([]);
            }
        },
        [circuit, mouseState]
    );

    return (
        <svg
            ref={ref}
            id="connections"
            width="100%"
            height="100%"
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onClick={onClick}
        >
            {Array.from(circuit.context?.connections.values() || []).map(connection => (
                <Connection key={connection.id} connection={connection} />
            ))}

            {circuit.connectionDraft && <Connection output={circuit.connectionDraft} point={mousePosition} />}
        </svg>
    );
});

const Selection = observer(() => {
    const circuit = useCircuit();

    if (!circuit.selectionBounds) {
        return null;
    }

    const bounds = normalizeBounds(circuit.selectionBounds);

    const style = {
        width: `${bounds.width}px`,
        height: `${bounds.height}px`,
        transform: `translate(${bounds.x}px, ${bounds.y}px)`,
        backgroundColor: 'rgba(0, 0, 0, 0.2)'
    };

    return circuit.selectionBounds ? (
        <div className="absolute top-0 left-0 border border-accent z-20" style={style} />
    ) : null;
});

export const CircuitContainer = observer(
    // eslint-disable-next-line react/display-name
    React.forwardRef<HTMLDivElement, ICircuitContainerProps>((_, ref) => {
        const [contextMenuPosition, toggleContextMenu] = React.useState<Point | undefined>(undefined);
        const { projectId, activeLayerId } = useProject();
        const circuit = useCircuit();
        const { onMouseMove: mouseMoveHandler, mousePosition } = useMousePosition();
        useKeyboardActions();

        const { data: { layer: activeLayer } = { activeLayer: undefined } } = useQuery(LAYER_QUERY, {
            variables: { id: activeLayerId || '' }
        });

        const [updateLayer] = useMutation(UPDATE_LAYER_MUTATION);

        React.useEffect(() => {
            const valueReactionDisposer = reaction(
                () => circuit.context?.values,
                () => {
                    if (projectId && activeLayerId) {
                        const serializedCircuit = JSON.parse(JSON.stringify(circuit.context));

                        updateLayer({
                            variables: {
                                id: activeLayerId,
                                projectId: projectId,
                                circuit: serializedCircuit
                            },
                            optimisticResponse: {
                                updateLayer: {
                                    ...activeLayer,
                                    __typename: 'CircuitLayer',
                                    id: activeLayerId,
                                    circuit: serializedCircuit
                                }
                            }
                        });
                    }
                }
            );

            const positionReactionDisposer = reaction(
                () => circuit.context?.positions,
                debounce(() => {
                    if (projectId && activeLayerId) {
                        const serializedCircuit = JSON.parse(JSON.stringify(circuit.context));

                        updateLayer({
                            variables: {
                                id: activeLayerId,
                                projectId: projectId,
                                circuit: serializedCircuit
                            },
                            optimisticResponse: {
                                updateLayer: {
                                    ...activeLayer,
                                    __typename: 'CircuitLayer',
                                    id: activeLayerId,
                                    circuit: serializedCircuit
                                }
                            }
                        });
                    }
                }, 500)
            );

            return () => {
                valueReactionDisposer();
                positionReactionDisposer();
            };
        }, [circuit, activeLayer, updateLayer, activeLayerId, projectId]);

        const onMouseMove = React.useCallback(
            (e: React.MouseEvent<HTMLDivElement>) => {
                mouseMoveHandler(e);

                if (circuit.selectionBounds) {
                    const { x, y, width, height } = circuit.selectionBounds;

                    const bounds = {
                        x,
                        y,
                        width: width + e.movementX,
                        height: height + e.movementY
                    };

                    circuit.setSelectionBounds(bounds);
                }
            },
            [circuit, mouseMoveHandler]
        );

        const onMouseDown = React.useCallback(
            ({ nativeEvent, button }: React.MouseEvent<HTMLDivElement>) => {
                if ((nativeEvent.target as HTMLDivElement).id === 'connections' && button === 0) {
                    circuit.setSelectionBounds({ x: mousePosition.x, y: mousePosition.y, width: 0, height: 0 });
                }
            },
            [circuit, mousePosition]
        );

        const onMouseUp = React.useCallback(() => {
            circuit.setConnectionDraft();
            circuit.setSelectionBounds();
        }, [circuit]);

        const createNode = useCreateNode(
            circuit.context,
            contextMenuPosition
                ? toCartesianPoint(CIRCUIT_SIZE, CIRCUIT_SIZE, contextMenuPosition.x, contextMenuPosition.y)
                : undefined
        );

        const onContextMenuItemClick = React.useCallback(
            (nodeClass: ClassConstructor<Node>) => {
                toggleContextMenu(undefined);

                createNode(nodeClass);
            },
            [createNode, toggleContextMenu]
        );

        const onContextMenu = React.useCallback(
            (e: React.MouseEvent<HTMLDivElement>) => {
                e.preventDefault();

                toggleContextMenu(position => {
                    if (position) {
                        return undefined;
                    } else {
                        return mousePosition;
                    }
                });
            },
            [toggleContextMenu, mousePosition]
        );

        return (circuit.context?.nodes.size || 0) > 0 ? (
            <Circuit
                ref={ref}
                className={clsx('realtive bg-neutral-800')}
                size={{ width: CIRCUIT_SIZE, height: CIRCUIT_SIZE }}
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
                onContextMenu={onContextMenu}
            >
                <Nodes />
                <Connections mousePosition={mousePosition} />
                <Selection />
                {!!contextMenuPosition && (
                    <ContextMenuContainer
                        position={contextMenuPosition}
                        sections={[...nodesHierarchy(onContextMenuItemClick)]}
                        onClose={() => toggleContextMenu(undefined)}
                    />
                )}
            </Circuit>
        ) : null;
    })
);
