import { float, Prim, sqrt } from '@thi.ng/shader-ast';
import { Input, IInputProps, Output, IOutputProps } from '@usealma/graph';
import { defaults, defaultsDeep } from 'lodash';

import { ISquareRootNodeInputs, ISquareRootNodeOutputs, ISquareRootNodeProps } from './SquareRootNode.types';
import { PolymorphicNode } from '../../../models/PolymorphicNode/PolymorphicNode';
import { WebGLContext } from '../../../models/WebGLContext/WebGLContext';
import { WebGLNodeType } from '../../../types';

export class SquareRootNode extends PolymorphicNode {
    static description = 'Returns the square root of the given input.';
    static nodeName = 'Square Root';
    type = WebGLNodeType.SQUARE_ROOT;

    declare inputs: ISquareRootNodeInputs;
    declare outputs: ISquareRootNodeOutputs;

    constructor(context: WebGLContext, props: ISquareRootNodeProps = {}) {
        defaultsDeep(props, {
            data: {
                type: {
                    selected: 'float',
                    options: ['float', 'vec2', 'vec3', 'vec4']
                }
            }
        });

        super(context, props);

        this.inputs = {
            input: new Input(
                this,
                defaults<Partial<IInputProps<Prim>> | undefined, IInputProps<Prim>>(props.inputs?.input, {
                    name: 'Input',
                    type: 'float',
                    defaultValue: float(0)
                })
            )
        };

        this.outputs = {
            output: new Output(
                this,
                defaults<Partial<IOutputProps<Prim>> | undefined, IOutputProps<Prim>>(props.outputs?.output, {
                    name: 'Output',
                    type: 'float',
                    value: () => {
                        return sqrt<Prim>(this.resolveValue(this.inputs.input.value));
                    }
                })
            )
        };
    }
}
