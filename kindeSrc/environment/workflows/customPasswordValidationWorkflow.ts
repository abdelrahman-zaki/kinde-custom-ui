import {
    onNewPasswordProvidedEvent,
    WorkflowSettings,
    WorkflowTrigger,
    invalidateFormField,
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
    },
  };
  
  // The workflow code to be executed when the event is triggered
  export default async function Workflow(event: onNewPasswordProvidedEvent) {
    console.log(event.context.auth.Password);
  }