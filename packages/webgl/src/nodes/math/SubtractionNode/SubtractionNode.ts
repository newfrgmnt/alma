import { float, sub } from '@thi.ng/shader-ast';
import { Input, IInputProps, Output, IOutputProps } from '@usealma/graph';
import { defaults, defaultsDeep } from 'lodash';

import { ISubtractionNodeInputs, ISubtractionNodeOutputs, ISubtractionNodeProps } from './SubtractionNode.types';
import { PolymorphicNode } from '../../../models/PolymorphicNode/PolymorphicNode';
import { WebGLContext } from '../../../models/WebGLContext/WebGLContext';
import { WebGLNodeType } from '../../../types';

export class SubtractionNode extends PolymorphicNode {
    static description = 'Performs subtraction on the inputs.';
    static nodeName = 'Subtraction';
    type = WebGLNodeType.SUBTRACTION;

    declare inputs: ISubtractionNodeInputs;
    declare outputs: ISubtractionNodeOutputs;

    constructor(context: WebGLContext, props: ISubtractionNodeProps = {}) {
        defaultsDeep(props, {
            data: {
                type: {
                    selected: 'float',
                    options: ['float', 'int', 'vec2', 'vec3', 'vec4', 'mat2', 'mat3', 'mat4']
                }
            }
        });

        super(context, props);

        this.inputs = {
            a: new Input(
                this,
                defaults<Partial<IInputProps<'float'>> | undefined, IInputProps<'float'>>(props.inputs?.a, {
                    name: 'A',
                    type: 'float',
                    defaultValue: float(0)
                })
            ),
            b: new Input(
                this,
                defaults<Partial<IInputProps<'float'>> | undefined, IInputProps<'float'>>(props.inputs?.b, {
                    name: 'B',
                    type: 'float',
                    defaultValue: float(0)
                })
            )
        };

        this.outputs = {
            result: new Output(
                this,
                defaults<Partial<IOutputProps<'float'>> | undefined, IOutputProps<'float'>>(props.outputs?.result, {
                    name: 'Result',
                    type: 'float',
                    value: () => {
                        return sub<'float', 'float'>(
                            this.resolveValue(this.inputs.a.value),
                            this.resolveValue(this.inputs.b.value)
                        );
                    }
                })
            )
        };
    }
}
