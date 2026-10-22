import {
    createKindeAPI,
    denyAccess,
    WorkflowTrigger,
    type WorkflowSettings,
    type onUserTokenGeneratedEvent,
  } from "@kinde/infrastructure";
  
  const PROPERTY_KEY = "absolute_refresh_expires_at";
  const ABSOLUTE_LIFETIME_MS = 1000;
  
  export const workflowSettings: WorkflowSettings = {
    id: "absoluteRefreshLifetime",
    name: "Enforce a user-level absolute refresh deadline",
    trigger: WorkflowTrigger.UserTokenGeneration,
    failurePolicy: { action: "stop" },
    bindings: {
      "kinde.auth": {},
      "kinde.env": {},
      "kinde.fetch": {},
      url: {},
    },
  };
  
  type UserProperty = { key: string; value: unknown };
  
  export default async function Workflow(event: onUserTokenGeneratedEvent) {
    const userId = event.context?.user?.id;
    const auth = event.context?.auth;
  
    if (
      !userId ||
      !auth ||
      typeof auth.isExistingSession !== "boolean" ||
      (auth.origin !== "authorization_request" &&
        auth.origin !== "refresh_token_request")
    ) {
      throw new Error("Missing or unsupported authentication context.");
    }
  
    const kindeAPI = await createKindeAPI(event);
    const endpoint = `users/${encodeURIComponent(userId)}/properties`;
  
    const isFreshAuthentication =
      auth.origin === "authorization_request" &&
      auth.isExistingSession === false;
  
    if (isFreshAuthentication) {
      const expiresAt = String(Date.now() + ABSOLUTE_LIFETIME_MS);
      const { data } = await kindeAPI.put({
        endpoint:
          `${endpoint}/${encodeURIComponent(PROPERTY_KEY)}` +
          `?value=${encodeURIComponent(expiresAt)}`,
      });
  
      // createKindeAPI returns the response body. Check API-level success too.
      if (data?.code !== "OK") {
        throw new Error("Unable to save the absolute refresh deadline: " + data);
      }
      return;
    }
  
    // Refresh and SSO reuse must preserve the stored deadline.
    const { data } = await kindeAPI.get({ endpoint });
    if (data?.code !== "OK" || !Array.isArray(data.properties)) {
      throw new Error("Unable to read the absolute refresh deadline.");
    }
  
    const raw = (data.properties as UserProperty[]).find(
      (property) => property?.key === PROPERTY_KEY,
    )?.value;
    const expiresAt =
      typeof raw === "string" && /^\d+$/.test(raw) ? Number(raw) : NaN;
  
    if (!Number.isSafeInteger(expiresAt) || expiresAt <= 0) {
      denyAccess("Fresh authentication is required. Please sign in again.");
      return;
    }
  
    // Read the clock after the API call, including at the exact boundary.
    if (Date.now() >= expiresAt) {
      denyAccess("Your session has expired. Please sign in again.");
      return;
    }
  }
  