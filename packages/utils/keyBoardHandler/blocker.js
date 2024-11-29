const foo = () => {
    return new Promise(resolve => setTimeout(()=> {
        resolve('lets test this too! testing cuncurrency')
    }, 5000));
}

foo().then((res)=> { console.log(res)})

