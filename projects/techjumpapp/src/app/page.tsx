import styles from "./page.module.css";
import {serverConfig} from "../serverConfig"
import {ModalCard} from "../client"

// Next.js will invalidate the cache when a
// request comes in, at most once every 60 seconds.
export const revalidate = 60
console.log(serverConfig.backendOneUrl, '<<<<<')
export const dynamic = 'force-dynamic'
// We'll prerender only the params from `generateStaticParams` at build time.
// If a request comes in for a path that hasn't been generated,
// Next.js will server-render the page on-demand.
export const dynamicParams = true // or false, to 404 on unknown paths
export default async function Home() {
    let data = {hello: 'frontend'};
    let dataTwo = {hello: 'frontend two'}

        const [responseOne, responseTwo] = await Promise.all(
            [
                fetch(serverConfig.backendOneUrl),
                fetch(serverConfig.backendTwoUrl)
            ]);
        data = await responseOne.json()
        dataTwo =  await responseTwo.json()
        console.log(data)

    return (
        <div className={styles.page}>
            <main className={styles.main}>
                <ModalCard>
                    YO changes!
                    <p>{data?.hello}</p>
                    <p>{dataTwo.hello}</p>
                </ModalCard>
            </main>
            <footer className={styles.footer}>
                This is footer
            </footer>
        </div>
    );
}
