import styles from "./page.module.css";
import {serverConfig} from "../serverConfig"
import {ModalCard} from "@kayuaga/ui-kit"


export default async function Home() {
    // const [responseOne, responseTwo] = await Promise.all(
    //     [fetch(serverConfig.backendOneUrl),
    //         fetch(serverConfig.backendOneUrl)])
    // const [data, dataTwo] = await Promise.all([responseOne.json(), responseTwo.json()])

    return (
        <div className={styles.page}>
            <main className={styles.main}>
                <ModalCard>
                    Nice card!
                </ModalCard>
            </main>
            <footer className={styles.footer}>
                This is footer
            </footer>
        </div>
    );
}
