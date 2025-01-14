import {
    getKindeRequiredCSS,
    getKindeRequiredJS,
    getKindeNonce,
    getKindeWidget,
    getKindeCSRF,
} from "@kinde/infrastructure";

export default async function Page() {
    return `
        <html>
            <head>
                <meta charset="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <meta name="robots" content="noindex" />
                <meta name="csrf-token" content="${getKindeCSRF()}" />
                <title>Hello World</title>
                ${getKindeRequiredJS}
                ${getKindeRequiredCSS}
            </head>
            <body>
                <div id="root" data-roast-root="/admin">
                    <header>
                        <h1>Company name</h1>
                    </header>
                    <main>
                        <h2>Hi</h2>
                        <div>${getKindeWidget()}</div>
                    </main>
                </div>
            </body>
        </html>
    `;
}