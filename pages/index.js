import Head from 'next/head'
import styles from '../styles/Home.module.css'
import { useSession, signIn, signOut } from "next-auth/react"

export default function Home() {
  const { data: session } = useSession()

  return (
    <div className={styles.container}>
      <Head>
        <title>Secure Next.js App</title>
        <meta name="description" content="Secure Next.js application with DevOps pipeline" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to <a href="https://nextjs.org">Secure Next.js!</a>
        </h1>

        <div className={styles.description}>
          {session ? (
            <>
              <p>Signed in as {session.user.email}</p>
              <button onClick={() => signOut()}>Sign out</button>
            </>
          ) : (
            <>
              <p>Not signed in</p>
              <button onClick={() => signIn()}>Sign in</button>
            </>
          )}
        </div>

        <div className={styles.grid}>
          <a href="/api/public" className={styles.card}>
            <h2>Public API &rarr;</h2>
            <p>Access a public API endpoint that doesn't require authentication.</p>
          </a>

          <a href="/api/protected" className={styles.card}>
            <h2>Protected API &rarr;</h2>
            <p>Try to access a protected API endpoint (requires authentication).</p>
          </a>
        </div>
      </main>

      <footer className={styles.footer}>
        <a
          href="https://vercel.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{' '}
          <span className={styles.logo}>
            Vercel
          </span>
        </a>
      </footer>
    </div>
  )
} 