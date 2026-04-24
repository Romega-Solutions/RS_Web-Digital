import { ViewTransition } from "react";

export default function RootTemplate({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ViewTransition enter="page-enter" exit="page-exit">
      {children}
    </ViewTransition>
  );
}
