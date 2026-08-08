import { useEffect } from "react";
import Cal, { getCalApi } from "@calcom/embed-react";

export default function CalEmbed({ theme }: { theme: "dark" | "light" }) {
  useEffect(() => {
    (async function () {
      const cal = await getCalApi({ namespace: "discovery" });
      cal("ui", { 
        hideEventTypeDetails: false, 
        layout: "column_view", 
        theme,
        cssVarsPerTheme: {
          light: { "cal-brand": "#0d9488" },
          dark: { "cal-brand": "#0d9488" }
        }
      });
    })();
  }, [theme]);

  return (
    <Cal
      key={theme}
      namespace="discovery"
      calLink="se7enlabs/discovery"
      style={{ width: "100%", height: "100%", overflow: "scroll" }}
      config={{ layout: "column_view", useSlotsViewOnSmallScreen: "true", theme }}
    />
  );
}
