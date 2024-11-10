const foo = () => {
    return new Promise(resolve => setTimeout(()=> {
        resolve('we are done! lets see here!!!!!!1111')
    }, 5000));
}

foo().then((res)=> { console.log(res)})

