const foo = () => {
    return new Promise(resolve => setTimeout(()=> {
        resolve('we are done! Let try another change!111')
    }, 5000));
}

foo().then((res)=> { console.log(res)})

