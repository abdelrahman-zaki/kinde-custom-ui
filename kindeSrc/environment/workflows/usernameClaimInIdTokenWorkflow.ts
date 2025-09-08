import {
    onUserTokenGeneratedEvent,
    WorkflowSettings,
    WorkflowTrigger,
    idTokenCustomClaims,
} from "@kinde/infrastructure";

// The setting for this workflow
export const workflowSettings: WorkflowSettings = {
    id: "onUserTokenGeneration",
    trigger: WorkflowTrigger.UserTokenGeneration,
    failurePolicy: {
        action: "stop",
    },
    bindings: {
        "kinde.idToken": {}, // required to modify id token claims
        url: {}, // required for url params
    },
};

// The workflow code to be executed when the event is triggered
export default async function Workflow(event: onUserTokenGeneratedEvent) {
    console.log(event);

    // const idToken = idTokenCustomClaims<{
    //     username: string;
    // }>();

    // idToken.username = "";
}