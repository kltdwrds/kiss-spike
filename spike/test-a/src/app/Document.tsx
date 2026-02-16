import styles from "./styles.css?url";

export const Document: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <html lang="en">
    <head>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>Hello World</title>
      <link rel="stylesheet" href={styles} />
      <link rel="modulepreload" href="/src/client.tsx" />
    </head>
    <body className="bg-gray-50 min-h-screen">
      {children}
      <script>import("/src/client.tsx")</script>
    </body>
  </html>
);
