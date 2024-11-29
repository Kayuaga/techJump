const foo = () => {
    return new Promise(resolve => setTimeout(()=> {
        resolve('lets test this too!')
    }, 5000));
}

foo().then((res)=> { console.log(res)})

