import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { AuthClient } from "@dfinity/auth-client";
import { HttpAgent, Actor } from "@dfinity/agent";
import { idlFactory as yourCanisterIDL } from "../../../declarations/clinqna_backend/clinqna_backend.did.js";
import { canisterId as yourCanisterId } from "../../../declarations/clinqna_backend";
import { Principal } from "@dfinity/principal";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const auth = useProvideAuth();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

function useProvideAuth() {
  const [authClient, setAuthClient] = useState(null);
  const [agent, setAgent] = useState(null);
  const [actor, setActor] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [principal, setPrincipal] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    (async () => {
      const client = await AuthClient.create();
      setAuthClient(client);
      const authenticated = await client.isAuthenticated();
      setIsAuthenticated(authenticated);
  
      let agentInstance;
      if (authenticated) {
        const identity = client.getIdentity();
        const principalText = identity.getPrincipal().toText();
        setPrincipal(principalText);
        agentInstance = new HttpAgent({ identity });
        await agentInstance.fetchRootKey();
        setAgent(agentInstance);
      } else {
        agentInstance = new HttpAgent(); 
        await agentInstance.fetchRootKey();
        setAgent(agentInstance);
      }
      const actorInstance = Actor.createActor(yourCanisterIDL, {
        agent: agentInstance,
        canisterId: yourCanisterId,
      });
      setActor(actorInstance);

      if (authenticated) {
        try {
          const identity = client.getIdentity();
          const principalText = identity.getPrincipal().toText();
          const principalObj = Principal.fromText(principalText);
          const defaultUser = {
            id: principalObj,
            username: principalText,
            role: { Patient: null },
            joinedAt: BigInt(Date.now()) * 1_000_000n,
            specialization: [],
          };
          await actorInstance.registerUser(defaultUser);
          setTimeout(async () => {
            const newUser = await actorInstance.getUser(principalObj);
            setUser(newUser || defaultUser);
          }, 700);
        } catch (e) {}
      }
    })();
  }, []);


  const login = useCallback(async () => {
    if (!authClient) return;
    await authClient.login({
      identityProvider: `http://${process.env.CANISTER_ID_INTERNET_IDENTITY}.localhost:4943/` || "https://identity.ic0.app",
      onSuccess: async () => {
        window.location.reload();
      },
    });
  }, [authClient]);

  const logout = useCallback(async () => {
    if (!authClient) return;
    await authClient.logout();
    window.location.reload();
  }, [authClient]);

  return {
    isAuthenticated,
    principal,
    agent,
    actor,
    user,
    setUser,
    login,
    logout,
  };
}
