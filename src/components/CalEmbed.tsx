import { useEffect } from "react";
import Cal, { getCalApi } from "@calcom/embed-react";

interface CalEmbedProps {
  theme: "dark" | "light";
  namespace: string;
}

export default function CalEmbed({ theme, namespace }: CalEmbedProps) {
  useEffect(() => {
    (async function () {
      const cal = await getCalApi({ namespace });
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
  }, [namespace, theme]);

  return (
    <Cal
      key={`${namespace}-${theme}`}
      namespace={namespace}
      calLink="se7enlabs/discovery"
      data-cal-embed={namespace}
      data-lenis-prevent="true"
      style={{
        width: "100%",
        height: "100%",
        minHeight: "0",
        overflow: "auto",
        overscrollBehavior: "contain",
        touchAction: "pan-y",
        position: "relative",
        zIndex: 0,
      }}
      config={{ layout: "column_view", useSlotsViewOnSmallScreen: "true", theme }}
    />
  );
}
