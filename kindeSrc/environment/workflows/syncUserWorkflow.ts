import {
    onPostAuthenticationEvent,
    WorkflowSettings,
    WorkflowTrigger,
    getEnvironmentVariable,
    createKindeAPI,
} from "@kinde/infrastructure";

// The settings for this workflow
export const workflowSettings: WorkflowSettings = {
    id: "postAuthentication",
    name: "UserSync",
    failurePolicy: {
        action: "stop",
    },
    trigger: WorkflowTrigger.PostAuthentication,
    bindings: {
        "kinde.env": {},
        url: {},
    },
};

// This workflow requires you to set up the Kinde management API
// You can do this by going to the Kinde dashboard.
//
// Create an M2M application with the following scopes enabled:
// * read:user_properties
// * read:users
//
// In Settings -> Environment variables set up the following variables with the
// values from the M2M application you created above:
//
// * KINDE_WF_M2M_CLIENT_ID
// * KINDE_WF_M2M_CLIENT_SECRET - Ensure this is setup with sensitive flag
// enabled to prevent accidental sharing

type SamlValue = { value?: string };
type SamlAttribute = { name?: string; values?: SamlValue[] };
type SamlAttributeStatement = { attributes?: SamlAttribute[] };

// The workflow code to be executed when the event is triggered
export default async function handlePostAuth(event: onPostAuthenticationEvent) {
    const isNewKindeUser = event.context.auth.isNewUserRecordCreated;

    // The user has been added to the Kinde user pool for the first time
    if (isNewKindeUser) {
        const kindeAPI = await createKindeAPI(event);

        const userId = event.context.user.id;
        console.log(event);

        const { data } = await kindeAPI.patch({
            endpoint: `user?id=${userId}`,
            params: {
                picture: "https://account.microsoft.com/favicon.ico",
            },
        });
    }

    const connectionId = event.context.auth.connectionId;
    const googleWorkspaceConnectionId = getEnvironmentVariable("GOOGLE_WORKSPACE_CONNECTION_ID")?.value;
    if (connectionId === googleWorkspaceConnectionId) {
        // logged in via Google Workspace

        const attributeStatements =
            event.context.auth.provider?.data?.assertion
                ?.attributeStatements as SamlAttributeStatement[] | undefined;

        // Guard: no SAML attributes available
        if (!attributeStatements?.length) return;

        // Look for "phone" (case-insensitive). Add aliases if you need, e.g. ["phone", "phone_number", "telephoneNumber"]
        const targetNames = ["phone"];

        const phoneAttr = attributeStatements
            .flatMap((s) => s.attributes ?? [])
            .find((a) => {
                const n = a.name?.toLowerCase();
                return n ? targetNames.includes(n) : false;
            });

        const phoneValue = phoneAttr?.values?.[0]?.value?.trim() || null;

        if (!phoneValue) return;

        const kindeAPI = await createKindeAPI(event);

        const userId = event.context.user.id;

        const phonePropertyKey = "phone_number";

        const { data } = await kindeAPI.put({
            endpoint: `users/${userId}/properties/${phonePropertyKey}?value=${phoneValue}`
        });
    }
}