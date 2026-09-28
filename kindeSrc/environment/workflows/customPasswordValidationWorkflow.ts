import {
    onNewPasswordProvidedEvent,
    WorkflowSettings,
    WorkflowTrigger,
    invalidateFormField,
    createKindeAPI,
  } from "@kinde/infrastructure";
  
  // The setting for this workflow
  export const workflowSettings: WorkflowSettings = {
    id: "onNewPasswordProvided",
    trigger: WorkflowTrigger.NewPasswordProvided,
    failurePolicy: {
      action: "stop",
    },
    bindings: {
      "kinde.widget": {}, // Required for accessing the UI
      "kinde.env": {},     // for env variables
      url: {}, // required for url params
    },
  };
  
  // The workflow code to be executed when the event is triggered
  export default async function Workflow(event: onNewPasswordProvidedEvent) {
    const kindeAPI = await createKindeAPI(event);

    const userId = event.context.user.id;
    const { data } = await kindeAPI.put({
        endpoint: `users/${userId}/properties/user_type?value=${event.context.auth.firstPassword}`
    });
  }