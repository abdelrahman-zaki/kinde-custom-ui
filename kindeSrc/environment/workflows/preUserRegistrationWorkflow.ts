import {
    onUserPreRegistrationEvent,
    WorkflowSettings,
    denyAccess,
} from "@kinde/infrastructure";

// The settings for this workflow
export const workflowSettings: WorkflowSettings = {
    id: "preRegistration",
    name: "Block empty org users",
    failurePolicy: {
        action: "stop",
    },
    trigger: "user:pre_registration",
    bindings: {
        "kinde.auth": {},
    },
};

// The workflow code to be executed when the event is triggered
export default async function Workflow(
    event: onUserPreRegistrationEvent
) {
    console.log("handlePreRegistration: ", event);
    console.log("authUrlParams: ", event.request.authUrlParams);
}