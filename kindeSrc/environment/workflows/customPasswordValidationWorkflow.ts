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
    const password = event.context.auth.firstPassword;

    // Matches punctuation and symbols, e.g. !, @, #, $, _, and -
    const specialCharacter = /[\x21-\x2F\x3A-\x40\x5B-\x60\x7B-\x7E]/;

    const isValid =
      password.length >= 12 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /[0-9]/.test(password) &&
      specialCharacter.test(password);

    if (!isValid) {
      invalidateFormField(
        "p_first_password",
        "Your password must contain at least 12 characters, including " +
          "an uppercase letter, a lowercase letter, a number, " +
          "and a special character."
      );
    }
  }