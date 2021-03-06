/**
 * @fileoverview Check for protocol relative URLs.
 */

/*
 * ------------------------------------------------------------------------------
 * Requirements
 * ------------------------------------------------------------------------------
 */

import { Category } from 'hint/dist/src/lib/enums/category';
import { debug as d } from 'hint/dist/src/lib/utils/debug';
import { ElementFound, IHint, HintMetadata } from 'hint/dist/src/lib/types';
import cutString from 'hint/dist/src/lib/utils/misc/cut-string';
import { HintContext } from 'hint/dist/src/lib/hint-context';
import { HintScope } from 'hint/dist/src/lib/enums/hintscope';

const debug = d(__filename);

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default class NoProtocolRelativeUrlsHint implements IHint {

    public static readonly meta: HintMetadata = {
        docs: {
            category: Category.security,
            description: 'Disallow protocol relative URLs'
        },
        id: 'no-protocol-relative-urls',
        schema: [],
        scope: HintScope.any
    }

    public constructor(context: HintContext) {

        const validate = async ({ element, resource }: ElementFound) => {
            if (debug.enabled) {
                const html: string = await element.outerHTML();

                debug(`Analyzing link\n${cutString(html, 50)}`);
            }

            /*
             * We need to use getAttribute to get the exact value.
             * If we access the src or href properties directly the
             * browser already adds http(s):// so we cannot verify.
             */

            const url: string = (element.getAttribute('src') || element.getAttribute('href') || '').trim();

            if (url.startsWith('//')) {
                debug('Protocol relative URL found');

                const message = `'${url}' should not be specified as a protocol-relative URL.`;

                await context.report(resource, message, { content: url, element });
            }
        };

        context.on('element::a', validate);
        context.on('element::link', validate);
        context.on('element::script', validate);
    }
}
