import { float, Prim, step } from '@thi.ng/shader-ast';
import { Input, IInputProps, Output, IOutputProps } from '@usealma/graph';
import { defaults, defaultsDeep } from 'lodash';

import { IStepNodeInputs, IStepNodeOutputs, IStepNodeProps } from './StepNode.types';
import { PolymorphicNode } from '../../../models/PolymorphicNode/PolymorphicNode';
import { WebGLContext } from '../../../models/WebGLContext/WebGLContext';
import { WebGLNodeType } from '../../../types';

export class StepNode extends PolymorphicNode {
    static description = 'Generates a step function by comparing input to edge.';
    static nodeName = 'Step';
    type = WebGLNodeType.STEP;

    declare inputs: IStepNodeInputs;
    declare outputs: IStepNodeOutputs;

    constructor(context: WebGLContext, props: IStepNodeProps = {}) {
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
            edge: new Input(
                this,
                defaults<Partial<IInputProps<Prim>> | undefined, IInputProps<Prim>>(props.inputs?.edge, {
                    name: 'Edge',
                    type: 'float',
                    defaultValue: float(0)
                })
            ),
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
                        return step<Prim, Prim>(
                            this.resolveValue(this.inputs.edge.value),
                            this.resolveValue(this.inputs.input.value)
                        );
                    }
                })
            )
        };
    }
}
