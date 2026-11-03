import * as z from "zod";

/*
 * Ponto único de entrada do zod. O modo "jitless" impede que o zod teste
 * `new Function` para compilar validadores: a Content Security Policy
 * (src/lib/csp.ts) não permite eval, e o teste aparecia como violação no
 * navegador. A validação continua igual, só sem a compilação.
 */
z.config({ jitless: true });

export { z };
