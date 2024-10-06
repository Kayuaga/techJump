import styles from "./page.module.css";
import { ModalCard } from "@ui-kit/ui-kit"


export default async function Home() {
    const data = await fetch(process.env.BACKEND_ONE_URL).then(res => res.json())
    const dataTwo = await fetch(process.env.BACKEND_TWO_URL).then((res) => res.json())
    console.log(data)
  return (
    <div className={styles.page}>
      <main className={styles.main}>
         <ModalCard>
             <div>{data.hello}</div>
             <div>{dataTwo.hello}</div>
         </ModalCard>
      </main>
      <footer className={styles.footer}>
      This is footer
      </footer>
    </div>
  );
}
