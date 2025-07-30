import {
    onPostAuthenticationEvent,
    WorkflowSettings,
    WorkflowTrigger,
    getEnvironmentVariable,
    createKindeAPI,
    fetch,
} from "@kinde/infrastructure";

// The settings for this workflow
export const workflowSettings: WorkflowSettings = {
    id: "postAuthentication",
    name: "UserPictureSync",
    failurePolicy: {
        action: "stop",
    },
    trigger: WorkflowTrigger.PostAuthentication,
    bindings: {
        "kinde.env": {},
        "kinde.fetch": {},
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

// The workflow code to be executed when the event is triggered
export default async function handlePostAuth(event: onPostAuthenticationEvent) {
    const isNewKindeUser = event.context.auth.isNewUserRecordCreated;

    // The user has been added to the Kinde user pool for the first time
    if (isNewKindeUser) {
        const kindeAPI = await createKindeAPI(event);

        const userId = event.context.user.id;

        const { data } = await kindeAPI.patch({
            endpoint: `user?id=${userId}`,
            params: {
                picture: "https://lh3.googleusercontent.com/a/ACg8ocL3rppOaNZe2cY98QfjbZnV9vptwTtpF6hihIcIMe-1lVEZTUaX=s96-c",
            },
        });
    }
}