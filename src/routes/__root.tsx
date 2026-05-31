import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet, createRootRouteWithContext, useRouter, HeadContent, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth";
import { ThemeProvider } from "@/lib/theme";
import { CustomCursor } from "@/components/CustomCursor";
import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center glass rounded-2xl p-10">
        <h1 className="text-7xl font-display text-gradient">404</h1>
        <h2 className="mt-4 text-xl">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">This route doesn't exist in the WARDEN console.</p>
        <a href="/" className="interactive mt-6 inline-flex items-center justify-center rounded-xl bg-gradient-primary px-5 py-2.5 text-sm font-medium text-primary-foreground">Return to console</a>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center glass rounded-2xl p-10">
        <h1 className="text-xl">System error</h1>
        <p className="mt-2 text-sm text-muted-foreground">Console hit an unexpected fault. Try again or return home.</p>
        <div className="mt-6 flex justify-center gap-2">
          <button onClick={() => { router.invalidate(); reset(); }} className="interactive rounded-xl bg-gradient-primary px-5 py-2.5 text-sm font-medium text-primary-foreground">Try again</button>
          <a href="/" className="interactive rounded-xl glass px-5 py-2.5 text-sm">Home</a>
        </div>
      </div>
    </div>
  );
}

const THEME_INIT = `try{var t=localStorage.getItem('warden.theme')||'dark';document.documentElement.classList.remove('dark','light');document.documentElement.classList.add(t);document.documentElement.style.colorScheme=t;}catch(e){document.documentElement.classList.add('dark');}`;

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "WARDEN — Smart Hotel Robotics Console" },
      { name: "description", content: "Real-time monitoring and control console for the WARDEN smart hotel robotics ecosystem." },
      { name: "author", content: "WARDEN" },
      { property: "og:title", content: "WARDEN — Smart Hotel Robotics Console" },
      { property: "og:description", content: "Real-time monitoring and control console for the WARDEN smart hotel robotics ecosystem." },
      { property: "og:type", content: "website" },
      { name: "twitter:title", content: "WARDEN — Smart Hotel Robotics Console" },
      { name: "twitter:description", content: "Real-time monitoring and control console for the WARDEN smart hotel robotics ecosystem." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/iWao69IYGLWAB5FPEJ4ZoV4ZLe73/social-images/social-1780164215702-Gemini_Generated_Image_43c1dn43c1dn43c1.webp" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/iWao69IYGLWAB5FPEJ4ZoV4ZLe73/social-images/social-1780164215702-Gemini_Generated_Image_43c1dn43c1dn43c1.webp" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap" },
    ],
    scripts: [{ children: THEME_INIT }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <CustomCursor />
          <Outlet />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
