import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import { useStore } from "./store/useStore";
import { AuthModal } from "./components/AuthModal";
import App from "./App";

export default function Root() {
  const { user, setUser, fetchCloudTasks, migrateLocalTasksToCloud, setSyncStatus } = useStore();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) setUser(session.user);
      setAuthChecked(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const incomingUser = session?.user ?? null;
        setUser(incomingUser);
        if (incomingUser) {
          await migrateLocalTasksToCloud();
          await fetchCloudTasks();
        } else {
          setSyncStatus("local");
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  if (!authChecked) return null;
  if (!user) return <AuthModal />;
  return <App />;
}