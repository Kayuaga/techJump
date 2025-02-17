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
interface DataI{
    length?:number
}
export default async function Home() {
    let data: DataI = {};
    let dataTwo: DataI = {}

        // const [responseOne, responseTwo] = await Promise.all(
        //     [
        //         fetch(serverConfig.backendOneUrl),
        //         fetch(serverConfig.backendTwoUrl)
        //     ]);
        // data = await responseOne.json()
        // dataTwo =  await responseTwo.json()
        // console.log(data, dataTwo)
    return (
        <div className={styles.page}>
            <main className={styles.main}>
                <ModalCard>
                    YO changes!
                    <p>{data?.length || 'YO TEST 1 '}</p>
                    <p>{dataTwo?.length || 'YO TEST 2'}</p>
                </ModalCard>
            </main>
            <footer className={styles.footer}>
                This is footer
            </footer>
        </div>
    );
}
