import { fromRAF } from '@thi.ng/rstream';
import { Layer, Circuit, createRenderSequence, render, nodes } from 'alma-webgl';
import * as React from 'react';

import { Scene } from '../../components/Scene/Scene';

const testShader = `void main() {
    // Time varying pixel color
    vec3 col = 0.5 + 0.5 * cos(time * .01 + v_uv.xyx + vec3(0., 2., 4.));

    // Output to screen
    fragColor = vec4(col, 1.0);
}`;

export const EditorRoute = () => {
    const canvasRef = React.useRef<HTMLCanvasElement>(null);

    React.useEffect(() => {
        if (canvasRef.current) {
            const gl = canvasRef.current.getContext('webgl2');

            if (!gl) {
                throw new Error('WebGL Context could not be created');
            }

            const layers: Layer[] = [
                new Layer({ context: testShader }),
                new Layer({
                    context: new Circuit(gl, {
                        textureManager: { textureResolver: () => new Image() },
                        cameraManager: { textureResolver: () => new Image() },
                        nodesCollection: nodes
                    })
                })
            ];

            const sequence = createRenderSequence(gl, layers);

            fromRAF().subscribe({
                next(t) {
                    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

                    gl.clearColor(0, 0, 0, 1);
                    gl.clear(gl.COLOR_BUFFER_BIT);

                    render(sequence, t);
                }
            });
        }
    }, []);

    return (
        <Scene>
            <div></div>
            <div>
                <canvas ref={canvasRef} width={720} height={480} />
            </div>
            <div></div>
        </Scene>
    );
};