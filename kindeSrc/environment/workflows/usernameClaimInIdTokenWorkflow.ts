import {
    onUserTokenGeneratedEvent,
    WorkflowSettings,
    WorkflowTrigger,
    createKindeAPI,
    idTokenCustomClaims,
} from "@kinde/infrastructure";

// This workflow requires you to set up the Kinde management API
// You can do this by going to the Kinde dashboard.
//
// Create an M2M application with the following scopes enabled:
// * read:organizations
// * read:organization_user_roles
//
// In Settings -> Environment variables set up the following variables with the
// values from the M2M application you created above:
//
// * KINDE_WF_M2M_CLIENT_ID
// * KINDE_WF_M2M_CLIENT_SECRET - Ensure this is setup with sensitive flag
// enabled to prevent accidental sharing

// The setting for this workflow
export const workflowSettings: WorkflowSettings = {
    id: "onUserTokenGeneration",
    trigger: WorkflowTrigger.UserTokenGeneration,
    failurePolicy: {
        action: "stop",
    },
    bindings: {
        "kinde.env": {},     // for env variables
        "kinde.idToken": {}, // required to modify id token claims
        url: {}, // required for url params
    },
};

// The workflow code to be executed when the event is triggered
export default async function Workflow(event: onUserTokenGeneratedEvent) {
    const idToken = idTokenCustomClaims<{
        given_name: string | null;
        roles: { id: string; key: string }[] | null;
        org_name: string | null;
    }>();

    console.log(idToken.given_name);

    idToken.roles = null;
    idToken.org_name = null;

    const kindeAPI = await createKindeAPI(event);

    const orgCode = event.context.organization.code;
    if (orgCode) {
        const { data: orgDetails } = await kindeAPI.get({
            endpoint: `organization?code=${orgCode}`,
        });

        const userId = event.context.user.id;
        const { data: rolesDetails } = await kindeAPI.get({
            endpoint: `organizations/${orgCode}/users/${userId}/roles`,
        });

        idToken.roles = rolesDetails.roles;
        idToken.org_name = orgDetails.name;
    }
}