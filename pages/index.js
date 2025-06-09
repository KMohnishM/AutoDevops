import Head from 'next/head'
import styles from '../styles/Home.module.css'
import { useSession, signIn, signOut } from "next-auth/react"
import DeployForm from '../components/DeployForm'
import LogViewer from '../components/LogViewer'
import { useState } from 'react'

export default function Home() {
  const { data: session } = useSession()
  const [jobId, setJobId] = useState(null)

  return (
    <div className={styles.container}>
      <Head>
        <title>AutoDevOps Platform</title>
        <meta name="description" content="Automated DevOps deployment platform" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <section className={styles.heroSection}>
          <h1 className={styles.heroTitle}>AutoDevOps Platform</h1>
          <p className={styles.heroSubtitle}>
            Deploy your app in one click. Real-time logs. Zero hassle.
          </p>
        </section>
        <div className={styles.authBox}>
          {session ? (
            <>
              <span>Signed in as <b>{session.user.email}</b></span>
              <button className={styles.authBtn} onClick={() => signOut()}>Sign out</button>
            </>
          ) : (
            <>
              <span>Not signed in</span>
              <button className={styles.authBtn} onClick={() => signIn()}>Sign in</button>
            </>
          )}
        </div>
        <DeployForm onJobStart={setJobId} />
        <LogViewer jobId={jobId} />
      </main>
      <footer className={styles.footer}>
        <a href="https://vercel.com" target="_blank" rel="noopener noreferrer">
          Powered by <span className={styles.logo}>Vercel</span>
        </a>
      </footer>
    </div>
  )
} 