import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";

declare global {
  interface Window {
    Tawk_API?: Record<string, unknown>;
    Tawk_LoadStart?: Date;
  }
}

export const TawkChat = () => {
  const { user, profile } = useAuth();

  useEffect(() => {
    // Read the combined Tawk.to ID/URL from environment variable
    const tawkToId = import.meta.env.VITE_TAWKTO_ID || "6a6c94614f48221d49ac03aa/1jus278t9";

    if (!tawkToId) return;

    // Dynamically build the embed URL depending on the format provided in the env var
    let embedUrl = "";
    if (tawkToId.startsWith("http")) {
      embedUrl = tawkToId;
    } else if (tawkToId.includes("/")) {
      embedUrl = `https://embed.tawk.to/${tawkToId}`;
    } else {
      // Fallback if they only provide property ID
      embedUrl = `https://embed.tawk.to/${tawkToId}/1jus278t9`;
    }

    const scriptId = "tawk-script";
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;

    if (!script) {
      // Initialize Tawk_API and Tawk_LoadStart
      window.Tawk_API = window.Tawk_API || {};
      window.Tawk_LoadStart = new Date();

      script = document.createElement("script");
      script.id = scriptId;
      script.async = true;
      script.src = embedUrl;
      script.charset = "UTF-8";
      script.setAttribute("crossorigin", "*");

      const firstScript = document.getElementsByTagName("script")[0];
      if (firstScript && firstScript.parentNode) {
        firstScript.parentNode.insertBefore(script, firstScript);
      } else {
        document.head.appendChild(script);
      }
    }

    const updateTawkUser = () => {
      const tawk = window.Tawk_API as Record<string, unknown>;
      if (tawk && typeof tawk.setAttributes === "function") {
        (tawk.setAttributes as (attrs: Record<string, unknown>, cb: (err: unknown) => void) => void)(
          {
            name:
              profile?.full_name ||
              user?.user_metadata?.full_name ||
              user?.email?.split("@")[0] ||
              "User",
            email: user?.email || "",
          },
          (err: unknown) => {
            if (err) {
              console.error("Error setting Tawk.to attributes:", err);
            }
          }
        );
      }
    };

    // If user is logged in, bind attributes
    if (user) {
      const tawk = (window.Tawk_API = window.Tawk_API || {}) as Record<string, unknown>;
      if (tawk.onLoad) {
        const originalOnLoad = tawk.onLoad as () => void;
        tawk.onLoad = function () {
          originalOnLoad();
          updateTawkUser();
        };
      } else {
        tawk.onLoad = updateTawkUser;
      }
      updateTawkUser();
    } else {
      // Reset attributes to generic if user logs out
      const tawk = window.Tawk_API as Record<string, unknown>;
      if (tawk && typeof tawk.setAttributes === "function") {
        (tawk.setAttributes as (attrs: Record<string, unknown>, cb: () => void) => void)(
          {
            name: "Guest",
            email: "",
          },
          () => {}
        );
      }
    }
  }, [user, profile]);

  return null;
};
