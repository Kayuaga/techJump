const foo = () => {
    return new Promise(resolve => setTimeout(()=> {
        resolve('we are done! I hope lerna will launch only this one !')
    }, 5000));
}

foo().then((res)=> { console.log(res)})

