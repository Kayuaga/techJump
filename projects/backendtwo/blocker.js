const foo = () => {
    return new Promise(resolve => setTimeout(()=> {
        resolve('we are done!')
    }, 5000));
}

foo().then((res)=> { console.log(res)})
